"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse5_1 = require("parse5");
class Element {
    constructor(tag, value, attr, children) {
        this.tag = tag;
        this.value = value;
        this.attr = attr;
        this.children = children;
    }
    static parse(html) {
        const element = parse5_1.parse(html);
        return Element.convert(element);
    }
    static convert(element) {
        const el = new Element(element.tagName, '', {}, []);
        if (element.attrs)
            element.attrs.forEach((attr) => el.attr[attr.name] = attr.value);
        if (element.childNodes) {
            element.childNodes.forEach(e => {
                if (e.nodeName == '#text') {
                    if (e.value && e.value.trim()) {
                        if (el.value && el.value.slice(-1) != ' ' && el.value.slice(-1) != '\n')
                            el.value += ' ';
                        el.value += e.value.trim();
                    }
                }
                else {
                    const child = Element.convert(e);
                    el.children.push(child);
                    if (child.tag == 'span' ||
                        child.tag == 'a' ||
                        child.tag == 'em' || child.tag == 'i' ||
                        child.tag == 'strong' || child.tag == 'b' ||
                        child.tag == 'nobr') {
                        if (el.value && el.value.slice(-1) != ' ' && el.value.slice(-1) != '\n')
                            el.value += ' ';
                        el.value += child.value.trim();
                    }
                    else if (child.tag == 'br')
                        el.value += '\n';
                    else if (child.tag == 'p')
                        el.value += '\n' + child.value.trim();
                }
            });
        }
        el.value = el.value.trim();
        return el;
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
}
exports.default = Element;
