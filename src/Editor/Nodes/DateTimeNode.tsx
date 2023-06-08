import { LexicalNode, SerializedTextNode, Spread, TextNode } from "lexical";

export type SerializedDateTimeNode = Spread<
  {
    className: string;
    type: string;
  },
  SerializedTextNode
>;

export class DateTimeNode extends TextNode {
  static getType(): string {
    return "date-time-node";
  }

  static clone(node: DateTimeNode): DateTimeNode {
    // eslint-disable-next-line no-underscore-dangle
    return new DateTimeNode(node.__key);
  }

  constructor(text: string, key?: string) {
    super(text, key);
    // eslint-disable-next-line no-underscore-dangle
    this.__style = "color: red;";
  }

  static importJSON(serializedNode: SerializedDateTimeNode): DateTimeNode {
    const node = new DateTimeNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedDateTimeNode {
    return {
      ...super.exportJSON(),
      type: DateTimeNode.getType(),
      className: this.getClassName(),
    };
  }

  getClassName(): string {
    const self = this.getLatest();
    // eslint-disable-next-line no-underscore-dangle
    return self.__className;
  }
}

export function $createDateTimeNode(text: string): DateTimeNode {
  return new DateTimeNode(text);
}

export function $isDateTimeNode(node: LexicalNode | null): boolean {
  return node instanceof DateTimeNode;
}
