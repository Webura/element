export default class Element {
    tag: string;
    value: string;
    attr: {
        [attribute: string]: string;
    };
    children: Element[];
    private constructor();
    static parse(html: string): Element;
    getValues(): string;
    filter(filter: (node: Element) => boolean): Array<Element>;
    find(filter: (node: Element) => boolean): Element | undefined;
    getNumberValue(): number;
    toString(): string;
}
//# sourceMappingURL=index.d.ts.map