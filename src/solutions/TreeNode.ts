const getIndent = (indent?: string) => {
  if (indent) return indent;
  else return "";
};

class TreeNode<T> {
  children: Set<TreeNode<T>>;
  parent?: TreeNode<T>;
  name: string;
  value: T;

  constructor(name: string, value: T, parent?: TreeNode<T>) {
    this.name = name;
    this.value = value;
    this.children = new Set();
    this.parent = parent;
  }

  addNode(name: string, value: T): TreeNode<T> {
    // Add only if not already present
    let childNode = [...this.children].find((c) => c.name === name);
    if (!childNode) {
      childNode = new TreeNode(name, value, this);
      this.children.add(childNode);
    }
    return childNode;
  }

  getChildrenValue(): number {
    return [...this.children].reduce(
      (total, child) => (total += child.getTreeValue()),
      0
    );
  }

  getTreeValue(): number {
    return this.getChildrenValue() + Number(this.value); // little hack about T <-> number
  }

  getAllNodesWithoutValue(nodes?: TreeNode<T>[]): TreeNode<T>[] {
    const newNodes: TreeNode<T>[] = nodes ? nodes : [];
    if (this.value === 0) newNodes.push(this);
    for (const child of this.children) {
      const childNodes = child.getAllNodesWithoutValue(nodes);
      newNodes.push(...childNodes);
    }
    return newNodes;
  }

  toString(noValueSymbol: string, indent?: string): string {
    let res = `\n${getIndent(indent)}${this.value === 0 ? noValueSymbol : ""}${
      this.name
    }`;
    res +=
      this.value !== 0
        ? ` (size=${this.value}b)`
        : ` (size=${[...this.children].reduce(
            (acc, c) => acc + c.getTreeValue(),
            0
          )}b)`;
    res += `\n${getIndent(indent)}Parent=${
      this.parent ? this.parent.name : "_"
    }`;
    res += `\n${getIndent(indent)}Children=[`;
    res += [...this.children].map((c) => {
      return "\n" + c.toString(noValueSymbol, getIndent(indent) + "    ");
    });
    res += this.children.size === 0 ? "]" : "\n" + getIndent(indent) + "]";
    return res;
  }
}

export default TreeNode;
