import ConversationApi from './ConversationApi';
import LogoutConversation from './LogoutConversation';
import LogInteractionConversation from './LogInteractionConversation';
import { Actions } from 'react-native-router-flux';
import { INTERACTION_NAMES } from './ActivityApi';
import { messages, Sender, Status } from './Messages';
import get from 'lodash.get';

const ACTIONABLE_INTENTS = [
  'contact.add',
  'contact.edit',
  'local-insights.by-location',
];

class ConversationService {
  // Poor-man's singleton const
  get YES_NO() {
    return [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ];
  }

  constructor() {
    ConversationApi.onMessage(message => this.say(message));
    // register query handlers; the first to return true stops processing
    this.queryHandlers = [
      LogoutConversation,
      query => LogInteractionConversation.onConversationQuery(query),
      query => {
        const action = ConversationApi[query.intent ? 'intent' : 'query'](query);
        // ignore the output because we're already handling the onMessage callback
        this.say(action.finally(() => null));
        return true;
      },
    ];
  }

  // Register the handler for displaying queries. Registering a new handler
  // unregisters the previous one.
  //
  // handler.displayMessage(message) - message object to display
  // handler.displayMessageLoading(loading) - toggle loading indicator
  // handler.displayQuery(query) - text query to display
  //
  // Returns a function that unregisters the handler.
  addDisplayHandler(handler) {
    this.displayHandler = handler;
    return () => { if (this.displayHandler === handler) { this.displayHandler = null; } };
  }

  displayQuery(message, incomplete) {
    const object = {
      content: message.label || message,
      sender: Sender.user,
      incomplete,
    };
    messages.append(object);
  }

  displayMessage(message) {
    const object = {
      response: message,
      sender: Sender.kelle,
    };
    messages.append(object);
  }

  displayLoadingMessage(loading) {
    messages.onStatusChange(loading ? Status.loading : Status.normal);
  }

  displayText(text) {
    this.displayHandler && this.displayHandler.displayText(text);
  }

  // Display and handle a user query
  // Incomplete messages are replaced with the next message
  hear(message, incomplete) {
    if (!message) { return; }
    if (typeof message === 'string') {
      message = {
        label: message.trim(),
        value: message.trim(),
      };
    }
    if (typeof message.label === 'string') {
      this.displayQuery(message, incomplete);
    }

    if (!incomplete) {
      this.queryHandlers.some(handler => handler(message.intent ? message : message.value));
    }
  }

  // Display message to user
  say(message) {
    if (!message) { return; }
    if (typeof message === 'string') {
      message = { message };
    }
    if (message.then) {
      this.displayLoadingMessage(true);
      return message
        .then(message => {
          this.displayLoadingMessage(false);
        })
        .catch(error => {
          this.displayLoadingMessage(false);
        });
    }

    const context = get(message, 'details.meta.context', {});
    const isOpenScene = context.scene;
    if (isOpenScene) {
      console.log('open scene', { context });
      if (!Actions[context.scene]) {
        this.say('Sorry, this feature is not yet supported.');
        return;
      }
      Actions[context.scene](context.parameters);
      return;
    }

    const isQuestion = get(message, 'details.type') === 'question';
    if (isQuestion) {
      console.log('question', { message });
      this.questionFromMessage(message);
      return;
    }

    this.displayMessage(message);

    const nextIntent = message.next_intent;
    const nextIntentValue = get(message, 'next_intent.value', {});
    const nextIntentIntent = get(message, 'next_intent.intent');
    const shouldHearIntent = Object.values(nextIntentValue).some(Boolean);
    if (shouldHearIntent) {
      console.log('with some value', { nextIntent });
      this.hear(nextIntent);
      return;
    }

    const payload = get(message, 'details.payload', []);
    const hasOneOption = payload.length === 1;
    const isActionableIntent = ACTIONABLE_INTENTS.includes(nextIntentIntent);
    if (nextIntent && hasOneOption && !isActionableIntent) {
      console.log('with single option', { nextIntent, payload });
      nextIntent.value = payload[0];
      nextIntent.parameters = {
        'interaction-type': INTERACTION_NAMES[nextIntent.type],
      };
      this.hear(nextIntent);
      return;
    }
  }

  questionFromMessage(message) {
    this.ask(message.message).then(answer => {
      const nextIntent = message.next_intent;
      const value = nextIntent.value;

      for (const k in value) {
        value[k] = answer;
      }

      this.hear({
        ...nextIntent,
        value
      }, false);
    });
  }

  // Display question to user and collect their answer.
  //
  // question - message to display
  // options - optional array of options each in the form {label: 'Yes', value: true}
  //
  // We can add other types (e.g. {person}) later.
  //
  // Returns a promise resolved to the answer, or rejected if cancelled.
  ask(question, options) {
    return new Promise((resolve, reject) => {

      const responseHandler = (answer) => {
        this.queryHandlers.shift();
        if (answer.toLowerCase() === 'cancel') {
          this.say('Cancelled!');
          return true;
        }
        if (options) {
          answer = options.find((option) => (answer.toLowerCase() === (option.label || option).toLowerCase()));
          if (answer && answer.value !== undefined) {
            answer = answer.value;
          }
        }
        if (answer === undefined) {
          this.say('Please pick one of the given choices.');
          this.ask(question, options)
            .then((result) => resolve(result))
            .catch((result) => reject(result));
          return true;
        }
        resolve(answer);
        return true;
      };

      this.queryHandlers.unshift(responseHandler);

      let response = question;
      if (options) {
        response = {
          message: question,
          details: {
            type: 'options',
            payload: options.map(o => (o.label || o)),
          },
        };
      }
      this.say(response);
    });
  }
}

const Conversation = new ConversationService();

export default Conversation;