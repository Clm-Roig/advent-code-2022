class ValveTreeNode {
  isOpen: boolean;
  value?: number;
  connectedToValves: ValveTreeNode[];
  name: string;

  constructor(name: string) {
    this.name = name;
    this.isOpen = false;
    this.connectedToValves = [];
  }

  addConnection(child: ValveTreeNode) {
    this.connectedToValves.push(child);
  }

  toString(): string {
    let res = `\n\n${this.name}`;
    res += ` (v=${this.value})`;
    res += `\nConnected to=[${this.connectedToValves
      .map((c) => c.name)
      .join(",")}]`;
    return res;
  }
}

export default ValveTreeNode;
