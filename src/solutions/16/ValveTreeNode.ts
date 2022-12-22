class ValveTreeNode {
  isOpen: boolean;
  value?: number;
  parents: ValveTreeNode[];
  children: ValveTreeNode[];
  name: string;

  constructor(name: string) {
    this.name = name;
    this.isOpen = false;
    this.parents = [];
    this.children = [];
  }

  addParent(parent: ValveTreeNode) {
    this.parents.push(parent);
  }

  addChild(child: ValveTreeNode) {
    this.children.push(child);
    child.addParent(this);
  }

  toString(): string {
    let res = `\n\n${this.name}`;
    res += ` (v=${this.value})`;
    res += `\nParents=[${this.parents.map((p) => p.name).join(",")}]`;
    res += `\nChildren=[${this.children.map((c) => c.name).join(",")}]`;
    return res;
  }
}

export default ValveTreeNode;
