import { parse } from 'parse5';

interface Element5 {
  tagName: string;
  value: string;
  attrs: Array<{ name: string, value: string }>
  childNodes: Element5[];
  nodeName: string
}

export default class Element {
  tag: string;
  value: string;
  attr: { [attribute: string]: string };
  children: Element[];

  private constructor(tag: string, value: string, attr: any, children: Element[]) {
    this.tag = tag;
    this.value = value;
    this.attr = attr;
    this.children = children;
  }

  static parse(html: string): Element {
    const element: Element5 = (parse(html) as any) as Element5;
    return Element.convert(element);
  }

  private static convert(element: Element5): Element {
    const el = new Element(element.tagName, '', {}, []);
    if (element.attrs)
      element.attrs.forEach((attr: { name: string, value: string }) => el.attr[attr.name] = attr.value);
    if (element.childNodes) {
      element.childNodes.forEach(e => {
        if (e.nodeName == '#text') {
          if (e.value && e.value.trim()) {
            if (el.value && el.value.slice(-1) != ' ' && el.value.slice(-1) != '\n')
              el.value += ' ';
            el.value += e.value.trim();
          }
        } else {
          const child = Element.convert(e);
          el.children.push(child);
          if (child.tag == 'span' ||
            child.tag == 'a' ||
            child.tag == 'em' || child.tag == 'i' ||
            child.tag == 'strong' || child.tag == 'b' ||
            child.tag == 'nobr'
          ) {
            if (el.value && el.value.slice(-1) != ' ' && el.value.slice(-1) != '\n')
              el.value += ' ';
            el.value += child.value.trim();
          } else if (child.tag == 'br')
            el.value += '\n';
          else if (child.tag == 'p')
            el.value += '\n' + child.value.trim();
        }
      });
    }
    el.value = el.value.trim();
    return el;
  }

  getValues(): string {
    let values: string = this.value;
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

  filter(filter: (node: Element) => boolean): Array<Element> {
    let list: Array<Element> = [];
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

  find(filter: (node: Element) => boolean): Element | undefined {
    if (filter(this)) {
      return this;
    } else if (this.children) {
      let found: Element | undefined;
      this.children.find(child => {
        const f = child.find(filter);
        if (f)
          found = f;
        return f;
      });
      return found;
    } else
      return;
  }

  getNumberValue(): number {
    const num = this.value.replace(/[a-zA-Z\s]/g, '').replace(/\,/, '.')
    if (num === '' || num === '-')
      return 0;
    else
      return Number(num);
  }

}