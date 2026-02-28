import tr from '../assets/locales/tr.json';
import en from '../assets/locales/en.json';

type LocaleDict = Record<string, any>;

/**
 * LocalizationService - Framework independent text localization
 */
export class LocalizationService {
    private static instance: LocalizationService;
    private currentLang: 'en' | 'tr' = 'en';
    private dictionaries: Record<'en' | 'tr', LocaleDict>;

    private constructor() {
        this.dictionaries = {
            en,
            tr
        };
        // Initialization language will be set later by BootScene
    }

    public static getInstance(): LocalizationService {
        if (!LocalizationService.instance) {
            LocalizationService.instance = new LocalizationService();
        }
        return LocalizationService.instance;
    }

    public setLanguage(lang: 'en' | 'tr'): void {
        this.currentLang = lang;
        console.log(`🌐 Language set to: ${lang}`);
    }

    public getLanguage(): 'en' | 'tr' {
        return this.currentLang;
    }

    /**
     * Get translated string by key (e.g. "MENU.PLAY")
     */
    public get(key: string, ...args: any[]): string {
        try {
            const keys = key.split('.');
            let value: any = this.dictionaries[this.currentLang];

            for (const k of keys) {
                if (value && value.hasOwnProperty(k)) {
                    value = value[k];
                } else {
                    console.warn(`Missing translation key: [${key}] for language [${this.currentLang}]`);
                    // Fallback to English if Turkish is missing
                    if (this.currentLang !== 'en') {
                        return this.getFallback(key, args);
                    }
                    return key; // return the raw key string if nothing is found
                }
            }

            if (typeof value === 'string') {
                return this.formatString(value, args);
            }

            return key;
        } catch (e) {
            console.error(`Localization error for key: ${key}`, e);
            return key;
        }
    }

    private getFallback(key: string, args: any[]): string {
        try {
            const keys = key.split('.');
            let value: any = this.dictionaries['en'];

            for (const k of keys) {
                if (value && value.hasOwnProperty(k)) {
                    value = value[k];
                } else {
                    return key;
                }
            }

            if (typeof value === 'string') {
                return this.formatString(value, args);
            }
            return key;
        } catch {
            return key;
        }
    }

    private formatString(str: string, args: any[]): string {
        let formatted = str;
        for (let i = 0; i < args.length; i++) {
            formatted = formatted.replace(new RegExp(`\\{${i}\\}`, 'g'), String(args[i]));
        }
        return formatted;
    }
}
