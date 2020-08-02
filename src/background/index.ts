import {Header} from '../util/constants';
import {background, Message} from '../util/message';
import {Parser} from './Parser';

let parser: Parser;
let initializing = false;

const waitForInit = (): Promise<Parser> =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (parser) {
        clearInterval(interval);
        resolve(parser);
      }
    }, 100);
  });

const initParser = (): Promise<Parser> =>
  new Promise((resolve) => {
    if (!parser && !initializing) {
      console.log('initializing parser');
      initializing = true;
      new Parser()
        .init()
        .then((initializedParser) => {
          parser = initializedParser;
          resolve(initializedParser);
        })
        .catch((error) => console.warn(error));
    } else if (!parser && initializing) {
      console.log('waiting for parser to initialize');
      waitForInit().then((parser) => resolve(parser));
    } else {
      resolve(parser);
    }
  });

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    initParser().then((parser) => {
      const logLevel = message.level || 'log';

      // TODO handle adding new channels, custom emotes, etc
      try {
        switch (message.header) {
          case Header.RAW: {
            console[logLevel]('message.raw', message);
            const result = parser.process(message.data);
            sendResponse(background.compose(Header.PROCESSED, result));
            break;
          }
          default: {
            throw new Error('unhandled message type');
          }
        }
      } catch (error) {
        console.warn(error, message, sender);
        console.error(
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
          JSON.stringify(message),
          sender,
        );
        sendResponse(background.compose(Header.NACK));
      }
    });

    return true;
  },
);