export default class Element {
    constructor(tag, value, attr, children) {
        this.tag = tag;
        this.value = value;
        this.attr = attr;
        this.children = children;
    }
    static parse(html) {
        let start = html.indexOf('<!');
        if (start >= 0)
            html = html.substring(html.indexOf('>', start) + 1);
        html = html.trim();
        start = html.indexOf('<');
        const root = new Element('root', '', {}, []);
        let stack = [root];
        try {
            while (start >= 0) {
                if (html.substring(start, start + 4) == '<!--') {
                    const commentEnd = html.indexOf('-->', start + 4);
                    start = html.indexOf('<', commentEnd + 1);
                    continue;
                }
                const tagEnd = html.indexOf('>', start);
                if (tagEnd == -1)
                    throw new Error('No ending tag after start: ' + start);
                let end = tagEnd;
                if (html.indexOf(' ', start) > 0 && html.indexOf(' ', start) < end)
                    end = html.indexOf(' ', start);
                if (html.indexOf('\t', start) > 0 && html.indexOf('\t', start) < end)
                    end = html.indexOf('\t', start);
                if (html.indexOf('\n', start) > 0 && html.indexOf('\n', start) < end)
                    end = html.indexOf('\n', start);
                const attr = {};
                if (end != tagEnd) {
                    let attributes = html.substring(end, tagEnd).trim();
                    if (attributes) {
                        if (attributes[attributes.length - 1] == '/')
                            attributes = attributes.substring(0, attributes.length - 1).trim();
                        while (attributes) {
                            let keyEnd = attributes.length;
                            if (attributes.indexOf('=') > 0 && attributes.indexOf('=') < keyEnd)
                                keyEnd = attributes.indexOf('=');
                            if (attributes.indexOf(' ') > 0 && attributes.indexOf(' ') < keyEnd)
                                keyEnd = attributes.indexOf(' ');
                            const key = attributes.substring(0, keyEnd);
                            attributes = attributes.substring(keyEnd).trim();
                            if (!attributes) {
                                attr[key] = true;
                            }
                            else if (attributes[0] == '=') {
                                attributes = attributes.substring(1);
                                if (attributes[0] == '"') {
                                    const endQuote = attributes.indexOf('"', 1);
                                    if (endQuote > 0) {
                                        const value = attributes.substring(1, endQuote);
                                        attr[key] = value;
                                        attributes = attributes.substring(endQuote + 1).trim();
                                    }
                                }
                                else if (attributes[0] == "'") {
                                    const endQuote = attributes.indexOf("'", 1);
                                    if (endQuote > 0) {
                                        const value = attributes.substring(1, endQuote);
                                        attr[key] = value;
                                        attributes = attributes.substring(endQuote + 1).trim();
                                    }
                                }
                            }
                        }
                    }
                }
                const isClosingTag = html[start + 1] == '/';
                if (isClosingTag) {
                    start++;
                }
                let isSelfContaining = html[tagEnd - 1] == '/';
                if (html[end - 1] == '/')
                    end--;
                const tag = html.substring(start + 1, end).trim().toLowerCase();
                if (tag == 'img' || tag == 'br' || tag == 'hr' || tag == 'input' || tag == 'link' || tag == 'meta') {
                    isSelfContaining = true;
                }
                else if (tag == 'script') {
                    const current = new Element(tag, '', attr, []);
                    const scriptEnd = html.indexOf('</script>', tagEnd);
                    current.value = html.substring(tagEnd + 1, scriptEnd);
                    stack[stack.length - 1].children.push(current);
                    start = html.indexOf('<', scriptEnd + 1);
                    continue;
                }
                else if (tag == 'style') {
                    const current = new Element(tag, '', attr, []);
                    const styleEnd = html.indexOf('</style>', tagEnd);
                    current.value = html.substring(tagEnd + 1, styleEnd);
                    stack[stack.length - 1].children.push(current);
                    start = html.indexOf('<', styleEnd + 1);
                    continue;
                }
                if (tag.length > 50)
                    throw new Error('Incorrect tag: ' + tag);
                if (!tag.length)
                    throw new Error('Empty tag: ' + html.substring(start, start + 100));
                const current = new Element(tag, '', attr, []);
                if (isClosingTag) {
                    // CLOSING TAG
                    if (stack[stack.length - 1].tag == tag) {
                        stack.pop();
                    }
                    else if (stack.find(el => el.tag == tag)) {
                        while (stack[stack.length - 1].tag != tag)
                            stack.pop();
                    }
                    else {
                        //throw new Error(`Closing tag '${tag}' not matching stack: ${stack.map(s => '"' + s.tag + '"').join(', ')}`);
                    }
                }
                else if (isSelfContaining) {
                    // SELF CONTAINING TAG
                    stack[stack.length - 1].children.push(current);
                }
                else {
                    if (tag == 'tr' && stack.find(el => el.tag == 'tr')) { // TR EXCEPTION
                        while (stack[stack.length - 1].tag != tag)
                            stack.pop();
                        stack.pop();
                    }
                    stack[stack.length - 1].children.push(current);
                    stack.push(current);
                }
                start = html.indexOf('<', tagEnd);
                if (tagEnd + 1 < start) {
                    const text = html.substring(tagEnd + 1, start).trim();
                    if (text) {
                        if (isSelfContaining || isClosingTag) {
                            const textTag = new Element('#', '', {}, []);
                            textTag.value = text;
                            stack[stack.length - 1].children.push(textTag);
                        }
                        else if (html[start + 1] == '/') {
                            current.value += text;
                        }
                        else {
                            const textTag = new Element('#', '', {}, []);
                            textTag.value = text;
                            stack[stack.length - 1].children.push(textTag);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.error(e);
            throw new Error('Element parsing error at index: ' + start + '(' + html.substring(start, start + 100) + ')');
        }
        return root;
    }
    getValues() {
        let values = this.value;
        if (this.children) {
            this.children.forEach(child => {
                const childValues = child.getValues();
                if (values)
                    values += '\n';
                values += childValues.trim();
            });
        }
        return values;
    }
    filter(filter) {
        let list = [];
        if (filter(this)) {
            list.push(this);
        }
        if (this.children) {
            this.children.forEach(child => {
                const part = child.filter(filter);
                if (part.length > 0)
                    list = list.concat(part);
            });
        }
        return list;
    }
    find(filter) {
        if (filter(this)) {
            return this;
        }
        else if (this.children) {
            let found;
            this.children.find(child => {
                const f = child.find(filter);
                if (f)
                    found = f;
                return f;
            });
            return found;
        }
        else
            return;
    }
    getNumberValue() {
        const num = this.value.replace(/[a-zA-Z\s]/g, '').replace(/\,/, '.');
        if (num === '' || num === '-')
            return 0;
        else
            return Number(num);
    }
    toString() {
        let attr = '';
        for (let key in this.attr)
            attr += ` ${key}="${this.attr[key]}"`;
        let children = '';
        for (let child of this.children)
            children += child.toString();
        if (this.tag == '#')
            return this.value;
        else if (children || this.value)
            return `<${this.tag}${attr}>${this.value}${children}</${this.tag}>`;
        else
            return `<${this.tag}${attr} />`;
    }
}
//# sourceMappingURL=index.js.map