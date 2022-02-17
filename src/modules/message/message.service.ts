import { Locale } from '@constants';
import { Injectable } from '@nestjs/common';
import { MessageOptions } from '@modules/message/interfaces/message-options.interface';
import * as fs from 'fs';

@Injectable()
export class MessageService {
    private languages = {};

    constructor(private options: MessageOptions) {
        options.languages.forEach((language: string) => {
            const locationPath = options.path + language + '.json';
            const buffer = fs.readFileSync(locationPath, { encoding: 'utf8' });
            this.languages[language] = JSON.parse(buffer);
        });
    }

    getMessage(key: string, locale: Locale): string {
        const language = Object.keys(this.languages).includes(locale)
            ? locale
            : this.options.defaultLanguage;

        if (Object.keys(this.languages[language]).includes(key)) {
            return this.languages[language][key];
        } else {
            return this.languages[this.options.defaultLanguage][key];
        }
    }
}
