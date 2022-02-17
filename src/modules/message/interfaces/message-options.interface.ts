import { Locale } from '@constants';

export interface MessageOptions {
    path: string;
    languages: Locale[];
    defaultLanguage: Locale;
}
