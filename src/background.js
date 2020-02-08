const { loadData } = require('./storage');
const { compose } = require('./message').background;
const { Parser } = require('./parser');
const { MESSAGETYPES } = require('./constants');

chrome.runtime.onInstalled.addListener(() => {
    loadData()
        .then((data) => {
            console.log('loaded data', data)
            const parser = new Parser(data);

            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                const logLevel = message.level;
        
                // TODO handle adding new channels, custom emotes, etc
                switch (message.header) {
                    case MESSAGETYPES.MESSAGE.RAW: {
                        console.log('received', message);
                        const result = parser.process(message.data);
                        sendResponse(compose(MESSAGETYPES.MESSAGE.PROCESSED, result));
                        break;
                    };
                    default: {
                        console[logLevel]('unhandled message', message, sender);
                        sendResponse(compose(MESSAGETYPES.NACK));
                    };
                }
            });
        });
});
