
import { decode as b58dec } from 'bs58';

export class Node {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  public valueOf(): string {
    return this.id;
  }

  public toString(): string {
    return `Node(${this.id})`;
  }

  public equals(other: Node | string): boolean {
    if (typeof other === 'string') {
      return this.id === other;
    }

    if (other instanceof Node) {
      return this.id === other.id;
    }

    return false;
  }

  public decode(): Uint8Array {
    return b58dec(this.id.substring(3));
  }

  public isValid(): boolean {
    if (!this.id.startsWith('FC_')) {
      return false;
    }

    return this.decode().length === 32;
  }

  public distance(other: Node): Distance {
    return new Distance(this, other);
  }

  static parse(id: string): Node {
    const node = new Node(id);
    //process.env.IS_UNITTEST !== 'true' &&
    if (!node.isValid()) {
      throw new Error('Invalid ID');
    }

    return node;
  }
}

export class Distance {
  private _distance: number;

  constructor(node1?: Node, node2?: Node) {
    this._distance = 256;

    if (node1 !== undefined && node2 !== undefined) {
      const id1 = node1.decode();
      const id2 = node2.decode();

      for (let i = 0; i < 32; i++) {
        const x = id1[i] ^ id2[i];
        if (x === 0) {
          this._distance -= 8;
        } else {
          this._distance -= x.toString(2).padStart(8, '0').indexOf('1');
          break;
        }
      }
    }
  }

  public toString(): string {
    // console.log('Distance.toString()');
    return `Distance(${this._distance})`;
  }

  public lessThan(other: Distance | number): boolean {
    // console.log('Distance.lessThan()');
    if (typeof other === 'number') {
      return this._distance < other;
    }
    if (other instanceof Distance) {
      return this._distance < other._distance;
    }

    return false;
  }

  public equals(other: Distance | number): boolean {
    // console.log('Distance.lessThan()', typeof other, other);
    if (typeof other === 'number') {
      return this._distance === other;
    }
    if (other instanceof Distance) {
      return this._distance === other._distance;
    }
    return false;
  }
}
