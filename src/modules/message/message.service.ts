import { Locale } from '@constants';
import { Injectable } from '@nestjs/common';
import { MessageOptions } from '@modules/message/interfaces/message-options.interface';
import { readFileSync } from 'fs';

@Injectable()
export class MessageService {
    private languages = {};

    constructor(private options: MessageOptions) {
        options.languages.forEach((language: string) => {
            const locationPath = options.path + language + '.json';
            const buffer = readFileSync(locationPath, { encoding: 'utf8' });
            this.languages[language] = JSON.parse(buffer);
        });
    }

    getMessage(key: string, locale: Locale): string {
        const language = Object.keys(this.languages).includes(locale)
            ? locale
            : this.options.defaultLanguage;

        if (this.isExistsKey(key, language)) {
            return this.languages[language][key];
        } else if (this.isExistsKey(key, this.options.defaultLanguage)) {
            return this.languages[this.options.defaultLanguage][key];
        } else {
            return key;
        }
    }

    private isExistsKey(key: string, locale: Locale) {
        return Object.keys(this.languages[locale]).includes(key);
    }
}
