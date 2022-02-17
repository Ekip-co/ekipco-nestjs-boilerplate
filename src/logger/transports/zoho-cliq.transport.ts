import * as Transport from 'winston-transport';
import axios from 'axios';

export default class ZohoCliqTransport extends Transport {
  private apiKey: string;
  private readonly botName: string;
  private channel: string;
  private readonly title: string;
  private readonly botImage: string | null;
  private readonly thumbnail: string | null;

  constructor(
    apiKey,
    botName,
    channel,
    title,
    opts,
    botImage = null,
    thumbnail = null,
  ) {
    super(opts);
    this.apiKey = apiKey;
    this.botName = botName;
    this.channel = channel;
    this.title = title;
    this.botImage = botImage;
    this.thumbnail = thumbnail;
  }

  log(info, callback) {
    const metadata = info.metadata;

    const cliqMessage = {
      text: `Time: ${info.timestamp}\nLevel: ${info.level}\nMessage: ${info.message}`,
      bot: {
        name: this.botName,
        image: this.botImage || ' ',
      },
      card: {
        title: this.title,
        thumbnail: this.thumbnail || ' ',
        theme: 'modern-inline',
      },
    };

    if (Object.keys(metadata).length > 0) {
      cliqMessage['slides'] = [
        {
          type: 'label',
          title: 'Details',
          data: Object.keys(metadata).map((key) => {
            const meta = {};
            meta[key] = metadata[key];
            return meta;
          }),
        },
      ];
    }

    axios
      .post(
        `https://cliq.zoho.com/api/v2/channelsbyname/${this.channel}/message?zapikey=${this.apiKey}`,
        cliqMessage,
      )
      .catch(console.error);
    callback();
  }
}
