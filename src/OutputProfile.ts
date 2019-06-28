import { EMElement, EMAttribute, EMLiteral } from '@emmetio/abbreviation';
import { ProfileOptions, StringCase } from './types';

export const defaultProfile: ProfileOptions = {
    indent: '\t',
    tagCase: '',
    attributeCase: '',
    attributeQuotes: 'double',
    format: true,
    formatSkip: ['html'],
    formatForce: ['body'],
    inlineBreak: 3,
    compactBooleanAttributes: false,
    booleanAttributes: [
        'contenteditable', 'seamless', 'async', 'autofocus',
        'autoplay', 'checked', 'controls', 'defer', 'disabled', 'formnovalidate',
        'hidden', 'ismap', 'loop', 'multiple', 'muted', 'novalidate', 'readonly',
        'required', 'reversed', 'selected', 'typemustmatch'
    ],
    selfClosingStyle: 'html',
    inlineElements: [
        'a', 'abbr', 'acronym', 'applet', 'b', 'basefont', 'bdo',
        'big', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i',
        'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'object', 'q',
        's', 'samp', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
        'textarea', 'tt', 'u', 'var'
    ]
};

/**
 * Creates output profile for given options
 */
export default class OutputProfile {
    readonly options: ProfileOptions;
    /** Character used for quoting */
    readonly quoteChar: string;

    constructor(options?: Partial<ProfileOptions>) {
        this.options = { ...defaultProfile, ...options };
        this.quoteChar = this.options.attributeQuotes === 'single' ? '\'' : '"';
    }

    /**
     * Returns value of given option name
     */
    get<K extends keyof ProfileOptions>(name: K): ProfileOptions[K] {
        return this.options[name];
    }

    /**
     * Quote given string according to profile options
     */
    quote(str: string | EMLiteral | null): string {
        if (str && typeof str === 'object') {
            const before = str.before === '{' ? str.before : this.quoteChar;
            const after = str.after === '}' ? str.after : this.quoteChar;
            return `${before}${str.value || ''}${after}`;
        }

        return `${this.quoteChar}${str != null ? str : ''}${this.quoteChar}`;
    }

    /**
     * Output given tag name according to options
     */
    name(name: string): string {
        return strCase(name, this.options.tagCase);
    }

    /**
     * Outputs attribute name according to current settings
     */
    attribute(attr: string): string {
        return strCase(attr, this.options.attributeCase);
    }

    /**
     * Check if given attribute is boolean
     */
    isBooleanAttribute(attr: EMAttribute): boolean {
        return attr.boolean
            || this.get('booleanAttributes').includes((attr.name || '').toLowerCase());
    }

    /**
     * Returns a token for self-closing tag, depending on current options
     */
    selfClose(): string {
        switch (this.options.selfClosingStyle) {
            case 'xhtml': return ' /';
            case 'xml': return '/';
            default: return '';
        }
    }

    /**
     * Returns indent for given level
     */
    indent(level: number = 0): string {
        let output = '';
        while (level--) {
            output += this.options.indent;
        }

        return output;
    }

    /**
     * Check if given tag name belongs to inline-level element
     * @param node Parsed node or tag name
     */
    isInline(node: string | EMElement): boolean {
        if (typeof node === 'string') {
            return this.get('inlineElements').includes(node.toLowerCase());
        }

        // inline node is a node either with inline-level name or text-only node
        return node.name ? this.isInline(node.name) : Boolean(node.value && !node.attributes.length);
    }
}

function strCase(str: string, type: StringCase) {
    if (type) {
        return type === 'upper' ? str.toUpperCase() : str.toLowerCase();
    }

    return str;
}
