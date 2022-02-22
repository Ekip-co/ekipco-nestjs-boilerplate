import { Locale } from '@enums';

export interface MessageOptions {
    path: string;
    languages: Locale[];
    defaultLanguage: Locale;
}
