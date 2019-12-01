import React, { Component } from 'react';
import { View, Linking, TouchableWithoutFeedback } from 'react-native';
import { Actions } from 'react-native-router-flux';
import get from 'lodash.get';
import moment from 'moment';

import SpeechBubble from './SpeechBubble';
import ResponseCard from './ResponseCard';
import ResponseListCard from './ResponseCard/List';
import ResponsePromptCard from './ResponseCard/Prompt';

import Task from './ResponseCard/Task/Task';
import Person from './ResponseCard/Person';
import Goal from './ResponseCard/Goal';
import Activity from './ResponseCard/Activity';
import Media from './ResponseCard/Media';
import Faq from './ResponseCard/Faq';
import ChoiceSelection from './ResponseCard/ChoiceSelection';
import ReferralList from './Referrals/ReferralList';
import SingleReferral from './Referrals/SingleReferral';
import Slider from './Slider';
import ConversationApi from '../services/ConversationApi';
import Conversation from '../services/Conversation';
import LimitedAccess from './ResponseCard/LimitedAccess';
import SnapshotCard from './SnapshotCard';
import ListingsCard from './ListingsCard';
import ListCard from './ListCard';
import { DefaultListCardItem } from './ListCardItems';
import ProfitShareCard from './ProfitShareCard';
import MapCard from './MapCard';
import LoanCard from './ResponseCard/Loan';
import MentionResponseCard from './MentionResponseCard';

import ScheduleResponse from './Responses/Schedule';
import ScheduleListResponse from './Responses/ScheduleList';

import helpQuestions from '../help_questions';
import Listing from '../models/Listing';
import Referral from '../models/Referral';
import Insight from '../models/Insight';
import Loan from '../models/Loan';
import Mention from '../models/Mention';

import MapCardFactory from './MapCard/factory';

import ActionService from '../services/ActionService';
import LoanItem from './LoanItem';

import SmartPlansResponse from '../features/smartplans/list/Response';
import TextCard from '../common/Components/Cards/Text';

const styles = {
  container: {
    margin: 15,
    marginTop: 0,
  },
};

class Response extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: get(props, 'response.details.payload'),
    };
  }

  render() {
    let card = null;
    const details = this.props.response.details;
    let onSelect;
    if (this.props.response.next_intent && !this.props.response.next_intent.value) {
      onSelect = (item) => {
        this.setState({ items: [item] });

        Conversation.hear({
          ...this.props.response.next_intent,
          value: item.value || item,
        });
      };
    }
    if (details) {
      switch (details.type) {
        case 'faq':

          //Conversation Category FAQ
          if (details.meta && details.meta.context && details.meta.context.category) {
            const category = helpQuestions.find(c => c.title === details.meta.context.category);
            if (!category) {
              break;
            }

            card = (<View>
              <SpeechBubble>{"Try asking me..."}</SpeechBubble>
              <SpeechBubble>{`"${category.questions[0]}" or "${category.questions[1]}"`}</SpeechBubble>
            </View>);
            break;
          }

          //General Conversation FAQ
          card = (
            <Slider
              data={helpQuestions}
              renderItem={item => (
                <Faq
                  title={item.item.title}
                  image={item.item.icon}
                  questions={item.item.questions.slice(0, 2)}
                />
              )}
            />
          );
          break;
        case 'task':
          if (this.state.items.length === 1) {
            card = (
              <ResponseCard>
                <Task task={this.state.items[0]} type="detail" />
              </ResponseCard>
            );
          } else {
            card = <ResponseListCard items={this.state.items} renderItem={(task) => <Task task={task} />} />
          }
          break;

        case 'map-preview':
        case 'contacts-map': {
          const MODEL_TYPE_TO_MAP_TYPE = {
            'contacts': 'contacts',
            'contact': 'contacts',
            'user': 'agents',
          }

          const title = get(details, 'meta.context.title', 'Contacts near me');
          const type = get(details, 'meta.context.@type', 'contact');
          const query = get(details, 'meta.query');
          const items = get(details, 'payload', []);
          const mapCardFactory = new MapCardFactory();
          const locations = items.map(item => mapCardFactory.create(type, item));
          const onPress = () => {
            Actions.maps({
              selection: MODEL_TYPE_TO_MAP_TYPE[type],
              locations,
              address: { description: query },
              total: get(details, 'meta.pagination.total', locations.length),
              next: get(details, 'meta.pagination.links.next'),
              expanded: true,
            });
          };
          card = <MapCard title={title} locations={locations} onPress={onPress} />;
          break;
        }
        case 'contacts':
        case 'person':
        case 'user':
          const type = details.type === 'contacts' ? 'command' : 'connect';
          if (!this.state.items) {
            card = (
              <ResponseCard>
                <LimitedAccess
                  more={() => { Actions.labSignUp({ labSignUp: this.state.items }) }}
                />
              </ResponseCard>
            );
          } else if (this.state.items.length === 1) {
            const person = this.state.items[0];
            card = (
              <ResponseCard>
                <Person person={person} type={type} />
              </ResponseCard>
            );
          } else {
            const renderSlide = (p) => {
              const disabled = onSelect && this.props.response.next_intent &&
                this.props.response.next_intent.parameters.detail && !p.item[this.props.response.next_intent.parameters.detail] &&
                `No ${this.props.response.next_intent.parameters.detail}`;
              return <Person person={p.item} type={type} onSelect={onSelect} disabled={disabled} />;
            };
            const makeMore = (details) => {
              if (details.meta && details.meta.pagination && details.meta.pagination.links.next) {
                return () => {
                  return ConversationApi.more(details.type, details.meta.pagination.links.next)
                    .then(moreDetails => ({
                      items: moreDetails.payload,
                      more: makeMore(moreDetails),
                    }));
                };
              }
            };
            card = (<Slider data={this.state.items} renderItem={renderSlide} more={makeMore(details)} />);
          }
          break;
        case 'goal-summary': {
          const renderListGroup = (data) => {
            if (data.item.body) {
              return renderPromptCard(data.item);
            }
            return renderListCard(data.item);
          };

          const renderPromptCard = (item) => {
            return (<ResponsePromptCard
              title={get(item, 'title', 'CGI Goals')}
              action={() => Actions.inputsEdit({
                title: get(item, 'inputs_title', 'CGI Inputs'),
                url: get(item, '_links.inputs.href', {}),
                onSave: () => { },
              })}
              actionLabel={get(item, '_links.create.title', 'Add Goals')}
              prompt={get(item, 'body')}
            />);
          };

          const renderListCard = (item) => {
            return (<ResponseListCard
              title={get(item, 'title', 'CGI Goals')}
              action={() => Actions.inputs({
                title: get(item, 'inputs_title', 'CGI Inputs'),
                url: get(item, '_links.inputs.href', {})
              })}
              actionLabel={get(item, '_links.inputs.title', 'Update Goals')}
              items={get(item, 'items', [])}
              renderItem={(goal) => (<Goal goal={goal} />)}
            />);
          };

          card = (<Slider
            data={details.payload}
            renderItem={renderListGroup}
          />);
          break;
        }

        case 'options':
          if (this.state.items.length === 1 && this.state.items[0].value === 'request.access') {
            onSelect = () => { Actions.labSignUp(); }
          }
          if (this.state.items.length === 1 && get(this.props.response, 'next_intent.intent') === 'contact.edit') {
            onSelect = (item) => {
              Actions.contactEdit({ contactId: item.value.contact_id });
            };
          }

          if (!onSelect) {
            onSelect = (item) => {
              this.setState({ items: [item] });

              if (item.action) {
                ActionService.handle(item.action, item.value);
                return;
              }

              if (item.next_intent) {
                if (item.next_intent.prompt) {
                  const type = Object.keys(item.next_intent.value)[0];
                  Conversation.ask(item.next_intent.prompt).then(result => {
                    Conversation.hear({
                      ...item.next_intent,
                      value: { [type]: result },
                    });
                  });
                  return;
                }
                Conversation.hear(item.next_intent);
                return;
              }
              Conversation.hear(item);
            }
          }

          card = <ChoiceSelection question={this.props.response.message} choices={this.state.items} onSelect={onSelect} />
          break;

        case 'interactions':
          card = <Activity activity={this.state.items} contact={details.meta.context} more={details.meta && details.meta.pagination} />
          break;

        case 'referrals':
        case 'referralnow':

          if (Array.isArray(details.payload) && details.payload.length === 1) {
            let title;
            if (details.meta && details.meta.context && details.meta.context.title) {
              title = details.meta.context.title;
            }

            card = (<SingleReferral title={title} referralType={details.type} referral={(new Referral(details.payload[0]))} />);
            break;
          }

          const referrals = [];
          for (const key in details.payload) {
            const info = details.payload[key];
            referrals.push({ title: info.title, data: info.entities || [] });
          }

          card = (
            <Slider
              data={referrals}
              renderItem={(i) => (
                <ReferralList
                  type={i.item.title}
                  referrals={i.item.data.map(r => new Referral(r))}
                />
              )}
            />
          );
          break;

        case 'snapshot': {
          const renderSnapshotCarousel = (item, width) => {
            const snapshot = item.item;
            const title = snapshot.name ? `Kelle Snap for ${snapshot.name}` : 'Kelle Snap';
            return <SnapshotCard title={title} marketSnapshot={snapshot} width={width} filters={details.meta.filters} />
          }

          card = (
            <Slider
              data={details.payload}
              renderItem={renderSnapshotCarousel}
            />
          );

          break;
        }
        case 'resource':
        case 'video':
        case 'audio':
        case 'file':
        case 'link':
        case 'content':
        case 'event':
        case 'course':
        case 'playlist':
        case 'page':
          card = <Media data={this.state.items} />
          break;
        case 'schedule': {
          card = <ScheduleResponse title={details.payload[0].title} events={details.payload[0].events} />
          break;
        }
        case 'schedule-list': {
          card = <ScheduleListResponse schedules={details.payload} />;
          break;
        }
        case 'listing':
          const pagination = (details.meta && details.meta.pagination) ? details.meta.pagination : null;
          const listings = this.state.items.map(l => { return new Listing(l); });
          card = <ListingsCard
            listings={listings}
            query={details && details.meta && details.meta.query}
            pagination={pagination}
          />;
          break;
        case 'feature': {
          const icon = require('../images/icon-insights-feature.png');
          const insights = this.state.items.map(i => new Insight(i));
          const query = get(details, 'meta.query');
          const title = query ? `Local Insights for ${query}` : 'Local Insights';

          const getInsightName = (user) => {
            if (!user) {
              return 'Anonymous';
            }
            const { first_name, last_name, name } = user;
            if (first_name && last_name) {
              return `${first_name} ${last_name}`;
            }
            if (name) {
              return name;
            }
            return 'Anonymous';
          };

          card = (
            <ListCard
              title={title}
              items={insights}
              renderItem={item => {
                const name = getInsightName(item.user);
                return (<TouchableWithoutFeedback
                  onPress={() => Actions.localInsights({
                    insights,
                    selectedInsight: item,
                  })}
                  key={item.id}
                >
                  <View>
                    <DefaultListCardItem
                      {...item}
                      icon={{ source: icon }}
                      votes={item.vote}
                      subtitle={name}
                    />
                  </View>
                </TouchableWithoutFeedback>);
              }}
              headerActionText="+"
              headerAction={() => {
                Actions.insightsCreate();
              }}
              footerActionText='View on Map'
              footerAction={() => {
                Actions.localInsights({ insights });
              }}
              moreAction={() => {
                Actions.localInsights({ insights });
              }}
            />
          );
          break;
        }
        case 'profit-share':
          const profitShares = this.state.items.map((profitShare) => {
            return {
              value: profitShare.value,
              subtitle: profitShare.subtitle,
            };
          });

          const renderProfitShareCard = (profitShare, idx) => (<ProfitShareCard key={`pf-${idx}`} profitShare={profitShare} />);

          card = (
            <ListCard
              items={profitShares}
              renderItem={renderProfitShareCard}
            />
          );
          break;
        case 'Loan':
          const loans = this.state.items.map(item => new Loan(item));

          if (loans.length > 1) {
            card = (<ListCard
              showCount={10}
              items={loans}
              renderItem={(item) => <LoanItem loan={item} />}
            />
            );
          } else {
            card = (<LoanCard loan={loans[0]} />);
          }

          break;

        case 'post':
        case 'poll':
        case 'reply': {
          const mention = new Mention(this.state.items[0]);
          return (<MentionResponseCard mention={mention} />);
        }

        case 'assignments': {
          card = (
            <View style={styles.container}>
              <SmartPlansResponse data={this.state.items[0]} />
            </View>
          );
          break;
        }

        case 'text-block': {
          const { heading, title, description, created_at } = this.state.items[0];
          const date = created_at ?
            moment(created_at) :
            null;

          card = (
            <View style={styles.container}>
              <TextCard
                heading={heading}
                title={title}
                description={description}
                created_at={date}
              />
            </View>
          );
        }

        default:
          break;
      }
    }
    let message = this.props.response.message || this.props.response.intent_message;

    if (details && details.type === 'options') {
      // the message for options is shown on the response card itself
      message = null;
    }

    return (
      <View>
        {(message && <SpeechBubble>{message}</SpeechBubble>) || null}
        {card}
      </View>
    );
  }
}

export default Response;