import get from 'lodash.get';

import Api from './Api';
import { Actions } from 'react-native-router-flux';
import UUIDGenerator from 'react-native-uuid-generator';

function transformDetails(details) {
  if (details && details.type === 'contacts') {
    details.payload = details.payload.map(contact => Api.transformContact(contact));
  }
  return details;
}

function transformResponse(response) {
  const data = { ...response.data };
  if (data.details && data.details.asked_at) {
    data.asked_at = data.details.asked_at;
    delete data.details.asked_at;
  }
  transformDetails(data.details);
  return data;
}

function targetsAnotherDeviceId(message) {
  const messageDeviceId = get(message, 'message.device_id');
  return messageDeviceId && messageDeviceId !== Api.deviceID;
}

class _ConversationApi {
  constructor() {
    this._requests = {};
    Api.onMessage((channel, message) => {
      if (targetsAnotherDeviceId(message)) {
        return;
      }
      if (channel !== Api.channels.messages) { return; }
      switch (message.message.status) {
        case 200:
          this._receive(message.message.request_id, transformResponse(message.message));
          break;

        case 401:
          Api.relogin()
            .then(() => {
              const request = this._requests[message.message.request_id];
              if (request && request.retry) {
                const retry = request.retry;
                delete request.retry;
                retry();
              } else {
                return Promise.reject();
              }
            }).catch(() => {
              Actions.login();
              this._receive(message.message.request_id, Api.translateError(message.message).data, true);
            });
          break;

        default:
          this._receive(message.message.request_id, Api.translateError(message.message).data, true);
          break;
      }
    });
  }

  _sendHttp(request) {
    return UUIDGenerator.getRandomUUID().then(requestId =>
      new Promise((resolve, reject) => {
        this._requests[requestId] = { resolve, reject };
        request.then(message => this._receive(requestId, message))
          .catch(error => this._receive(requestId, error, true));
      })
    );
  }

  _sendPubNub(message) {
    return UUIDGenerator.getRandomUUID().then(requestId =>
      new Promise((resolve, reject) => {
        const send = () => Api.pubnub.publish({
          channel: Api.channels.queries,
          message: {
            ...message,
            request_id: requestId,
            api_version: Api.apiVersion,
            app_version: Api.appVersion,
            api_token: Api.apiToken,
            auth_token: Api.authToken.split(':')[0],
            kw_uid: Api.user && Api.user.id,
          },
        }, (status, response) => {
          if (status.error) {
            console.log(status, response);
            if (!response) {
              response = status.errorData;
            }
            this._receive(requestId, response, true);
          }
        });
        this._requests[requestId] = { resolve, reject, retry: send };
        send();
      })
    );
  }

  _receive(requestId, msg, failed = false) {
    if (requestId) {
      const request = this._requests[requestId];
      if (request) {
        delete this._requests[requestId];
        if (failed) {
          request.reject(msg);
        } else {
          request.resolve(msg);
        }
      }
    }
    this.messageHandler && this.messageHandler(msg);
  }

  query(query) {
    if (Api.channels.queries) {
      return this._sendPubNub({ query });
    } else {
      return this._sendHttp(
        Api.axios.get('/ai/query', {
          params: {
            q: `${query}`,
          },
        }).catch(Api.handleError)
          .then(transformResponse)
      );
    }
  }

  intent(intent) {
    if (Api.channels.queries) {
      return this._sendPubNub({ intent });
    } else {
      return this._sendHttp(
        Api.axios.post('/ai/intent', intent)
          .catch(Api.handleError)
          .then(transformResponse)
      );
    }
  }

  notification(notification) {
    // TODO: add a socket version
    return Api.axios.post('/notifications/resolve', notification)
      .catch(Api.handleError)
      .then(transformResponse);
  }

  more(type, nextUrl) {
    return Api.axios.get(nextUrl)
      .catch(Api.handleError)
      .then(response => transformDetails({ ...response.data, payload: response.data.data, type }));
  }

  // register a handler for incoming messages
  onMessage(handler) {
    this.messageHandler = handler;
  }

  history(next = '/ai/conversations') {
    let index = 0;
    return Api.axios.get(next, { params: { per_page: 15 } })
      .catch(Api.handleError)
      .then(response => ({
        meta: response.data.meta,
        data: response.data.data.reduce((messages, conversation) => [
          ...(conversation.question ? [{
            content: conversation.question,
            sender: 'user',
            key: next + (index++),
            asked_at: conversation.asked_at,
          }] : []),
          {
            response: transformResponse({ data: conversation }),
            sender: 'kelle',
            key: next + (index++),
            asked_at: conversation.asked_at,
          },
          ...messages
        ], []).reverse(),
      }));
  }
}

const ConversationApi = new _ConversationApi();
export default ConversationApi;