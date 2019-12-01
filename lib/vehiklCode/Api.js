/* global FormData */

import 'react-native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import VersionNumber from 'react-native-version-number';
import PubNub from 'pubnub';
import autoBind from 'auto-bind';
import get from 'lodash.get';
import { AsyncStorage, Platform } from 'react-native';
import { GoogleAnalyticsTracker } from 'react-native-google-analytics-bridge';
import { Actions } from 'react-native-router-flux';
import UUIDGenerator from 'react-native-uuid-generator';
import Geolocation from 'react-native-geolocation-service';
import * as Localize from 'react-native-localize';

import FormDataService from '../services/FormDataService';

import User from '../models/User';
import { API_TARGET, API_TARGET_EXTENSION, API_BASE_URL } from '../constants';
import { applyMiddleware } from '../Middleware';
import { GeolocationMiddleware, DebugMiddleware, DeviceIdMiddleware } from '../Middleware/AxiosMiddleware';
import Location from './Location';
import Permissions from './Permissions';

export const APP_VERSION = [VersionNumber.appVersion]
  .concat(Platform.OS === 'ios' ? VersionNumber.buildVersion : []).join('.');
export const API_VERSION = '20191118';

export class ApiService {
  constructor() {
    autoBind(this);
    this.formDataService = new FormDataService();
    this.deviceID = DeviceInfo.getUniqueId();
    this.appVersion = APP_VERSION;
    this.apiVersion = API_VERSION;
    this.permissions = new Permissions();
    this.location = new Location(Geolocation, this.permissions);
    this.axios = applyMiddleware([
      (process.env.NODE_ENV === 'development') ? new DebugMiddleware() : null,
      new GeolocationMiddleware(this),
      new DeviceIdMiddleware(this),
    ])(axios.create({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Kelle-Version': API_VERSION,
        'Kelle-App-Version': APP_VERSION,
        'Kelle-Timezone': Localize.getTimeZone(),
      },
      baseURL: API_BASE_URL,
      timeout: 15000,
    }));
    this.handleError = this.handleError.bind(this);
    this.messageHandlers = [];
    this.messageListener = {
      message: (message) => {
        this.messageHandlers.forEach((handler) => {
          try {
            handler(message.channel, message);
          } catch (e) {
            console.error(e); // eslint-disable-line no-console
          }
        });
      },
    };
    this.authHandlers = [];

    UUIDGenerator.getRandomUUID().then(uuid => {
      if (!this.deviceID) {
        this.deviceID = uuid;
      }
    });
  }

  versionLabel() {
    let version = APP_VERSION;
    if (API_TARGET) {
      version += ` (${API_TARGET})`;
    }
    return version;
  }

  login(email, password) {
    return this.axios.post('/login', { email, password })
      .then((result) => {
        this._setAuth(result.data); // eslint-disable-line no-underscore-dangle
        this.user = new User(result.data.user);
        this.configureGoogleAnalyticsTracker(result);
        return {
          message: result.data.message,
          first_login: result.data.first_login,
        };
      });
  }

  relogin() {
    return AsyncStorage.getItem('auth_token')
      .then(authToken => this.axios.post('/relogin', { auth_token: authToken }, { timeout: 7500 })
        .catch((err) => {
          console.log({ ...err }); // eslint-disable-line no-console
          return Promise.reject(err);
        })
        .then((result) => {
          this.deregisterMessageListener();
          this._setAuth(result.data); // eslint-disable-line no-underscore-dangle
          this.user = new User(result.data.user);
          this.configureGoogleAnalyticsTracker(result);
          return {
            message: result.data.message,
          };
        }));
  }

  configureGoogleAnalyticsTracker(response) {
    if (!response.data.google_analytics) {
      return;
    }
    this.tracker = new GoogleAnalyticsTracker(response.data.google_analytics);
    this.tracker.setUser(response.data.user.id.toString());
    this.tracker.setAppVersion(APP_VERSION);
    this.tracker.setAppName(`Kelle ${Platform.OS === 'ios' ? 'iOS' : 'Android'}`);
  }

  logout() {
    this._notifyAuth(false) // eslint-disable-line no-underscore-dangle
      .finally(() => {
        this.deregisterMessageListener();
        delete this.axios.defaults.headers.Authorization;
        delete this.axios.defaults.headers['Kelle-Auth-Token'];
        this.user = null;
        return AsyncStorage.removeItem('auth_token');
      }).finally(() => Actions.login());
  }

  deregisterMessageListener() {
    if (this.pubnub) {
      this.pubnub.removeListener(this.messageListener);
    }
  }

  latestPosts(user) {
    return this.axios.get('/ai/user/content', {
      params: {
        creator: user.kw_uid,
      },
    }).catch(this.handleError)
      .then(response => response.data);
  }

  transformContact(_contact) {
    const contact = { ..._contact };
    if (!contact.name) {
      if (contact.preferred_name) {
        contact.name = contact.preferred_name;
      } else {
        contact.name = contact.last_name ? `${contact.first_name} ${contact.last_name}` : contact.first_name;
      }
    }
    contact.primary_email = contact.primary_email || contact.email;
    contact.email = contact.email || contact.primary_email;
    contact.primary_phone = contact.primary_phone || contact.phone;
    contact.phone = contact.phone || contact.primary_phone;
    contact.preferred_name = contact.preferred_name || contact.name;
    return contact;
  }

  getContact(id) {
    return this.axios.get(`/contacts/${id}`)
      .catch(this.handleError)
      .then(_ => this.transformContact(_.data.data));
  }

  trackPage(action) {
    if (!this.tracker) {
      return;
    }
    console.log(`Tracking page: ${action}`); // eslint-disable-line no-console
    this.tracker.trackScreenView(action);
  }

  trackEvent(category, action, opts = {}) {
    if (!this.tracker) {
      return;
    }
    console.log(`Tracking event: ${category}:${action}`); // eslint-disable-line no-console
    this.tracker.trackEvent(category, action, opts);
  }

  _setAuth(data) {
    this.authToken = data.auth_token;
    this.welcomeMessage = data.message;

    this.channels = [];

    // If the server isn't yet giving us channels, hardcode the push ones
    if (!data.socket) {
      data.socket = { // eslint-disable-line no-param-reassign
        channels: {
          'kelleReminders': `kelle${API_TARGET_EXTENSION}-${data.user.id}`,
          'messages': `kw${API_TARGET_EXTENSION}-${data.user.id}`,
          'referrals': `referrals${API_TARGET_EXTENSION}-${data.user.id}`,
          'connect': `connect${API_TARGET_EXTENSION}-${data.user.id}`,
          'broadcast': `kelle-all${API_TARGET_EXTENSION}`,
          'referral.offers': `referral.offers${API_TARGET_EXTENSION}-${data.user.id}`,
          'profitShare': `profit_share${API_TARGET_EXTENSION}-${data.user.id}`,
          'smartplans': `smartplans${API_TARGET_EXTENSION}-${data.user.id}`,
          'contacts': `contacts${API_TARGET_EXTENSION}-${data.user.id}`,
        },
      };
    }

    this.channels = data.socket.channels;

    this.pubnub = new PubNub({
      publishKey: data.sockets.publish,
      subscribeKey: data.sockets.subscribe,
    });

    this.pubnub.addListener(this.messageListener);
    this.pubnub.subscribe({
      channels: Object.keys(this.channels).map(key => this.channels[key]),
    });

    AsyncStorage.setItem('auth_token', this.authToken);

    const authorization = this.authToken.split(':')[0];
    this.axios.defaults.headers.Authorization = `Bearer ${authorization}`;

    return this._notifyAuth(true); // eslint-disable-line no-underscore-dangle
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // handle is called with true on auth, false on deauth (logout)
  onAuth(handler) {
    this.authHandlers.push(handler);
  }

  _notifyAuth(auth) {
    return Promise.all(
      this.authHandlers.map((handler) => {
        try {
          return handler(auth) || Promise.resolve();
        } catch (e) {
          console.error(e); // eslint-disable-line no-console
          return auth ? Promise.reject() : Promise.resolve();
        }
      }),
    );
  }

  handleError(error) {
    console.log({ ...error }); // eslint-disable-line no-console

    return this.handle401(error)
      .catch(err => Promise.reject(this.translateError(err.response).data));
  }

  // Retry 401 auth errors, falling back to login
  handle401(error) {
    if (error && error.response && error.response.status === 401) {
      return this.relogin()
        .then(() => {
          const config = {
            ...error.config,
            headers: {
              ...error.config.headers,
              ...this.axios.defaults.headers,
            },
          };
          return axios(config);
        }).catch(() => {
          this.logout();
          return Promise.reject(error);
        });
    }
    return Promise.reject(error);
  }

  follow(id) {
    return this.axios.post('/users/follow', {
      follow: id,
    }).then(res => res.data);
  }

  unfollow(id) {
    return this.axios.post(`/users/${id}/un-follow`).then(res => res.data);
  }

  contact(id) {
    return this.axios.get(`users/${id}`).then(res => res.data.data);
  }

  notificationRead(id) {
    this.axios.post(`/notification/${id}/read`).then(res => res.data);
  }

  addToCommand(user) {
    const data = this.formDataService.serialize(user);
    return this.axios.post('/contacts', data)
      .then(res => {
        const contact = get(res, 'data.details.payload[0]');

        if (contact) {
          return contact;
        }

        throw new Error('Contact was created but could not be displayed');
      })
      .catch(error => {
        const message = get(error, 'response.data.message', 'Could not add contact to Command, please try again later');
        throw new Error(message);
      });
  }

  requestAccess() {
    return this.axios.post('/contacts/request-access');
  }

  // Add a message field to response.data
  translateError(response) {
    const defaultServerError = "Sorry, I didn't get that. Please try again.";
    let message;
    if (response && response.status) {
      if (response.data && response.data.error) {
        message = response.data.error;
      }
      switch (response.status) {
        case 404:
          if (!message || message === defaultServerError) {
            message = "Sorry, I couldn't find that information.";
          }
          break;

        default:
          if (!message) {
            message = 'Sorry, something went wrong.';
          }
          break;
      }
    } else {
      message = "Sorry, I couldn't reach the server.";
    }
    return {
      ...(response || {}),
      data: {
        ...((response && response.data) || {}),
        message,
      },
    };
  }
}

const Api = new ApiService();

export default Api;