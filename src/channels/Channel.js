const Emote = require('./Emote');

class Channel {

    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.provider = data.provider;
    }

    // need to provide functions for at least:
    // url to fetch channel from
    // channelURL: (id: string) => string
    // url to fetch emote image from
    // emoteURL: (id: string) => string

    // initialize emotes for this channel
    async init() {
        console.log(`initializing channel ${this.provider}.${this.name}`);
        
        const data = await this.loadData();

        this.emotes = data.emotes
            .map((emote) => this.createEmote(emote));
        return this;
    }

    // load data from storage or fetch from api and save to storage if none is found
    async loadData() {
        const endpoint = this.channelURL(this.id);
        const response = await fetch(endpoint);
        
        if (response.status !== 200) {
            console.warn({
                message: `Invalid response from fetch`,
                data: await response.text(),
            });
            return null;
        }
        
        const data = await response.json();
        const parsedData = this.parseData(data);
        
        return parsedData;
    }

    // formatting data retrieved from endpoint into the form { emotes: Array<{ code: string, id: string }> }
    parseData(data) {
        return { emotes: data.emotes };
    }

    // create emote from formatted data emote
    createEmote(emote) {
        return new Emote({
            ...emote, 
            src: this.emoteURL(emote.id),
            provider: this.provider,
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            provider: this.provider,
            emotes: this.emotes.map((emote) => emote.toJSON()),
        };
    }

}

module.exports = Channel;