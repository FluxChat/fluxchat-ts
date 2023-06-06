import { createHash } from 'crypto';

export class Cash {
  public proof: string | null = null;
  public nonce: number | null = null;

  constructor(
    public readonly data: Buffer,
    public readonly bits: number,
  ) {
  }

  public toString(): string {
    return `Cash(${this.bits})`;
  }

  public mine(): number {
    this.nonce = Math.floor(Math.random() * 100000000);

    let cycle = 0;
    while (true) {
      cycle += 1;

      const inputData = Buffer.concat([
        Buffer.from('FC:'),
        Buffer.from(this.bits.toString()),
        Buffer.from(':'),
        this.data,
        Buffer.from(':'),
        Buffer.from(this.nonce.toString()),
      ]);

      const hash = createHash('sha256');
      const digest = hash.update(inputData).digest();

      let foundBits = 0;
      for (const c of digest) {
        if (c & 0b10000000) {
          break;
        }
        if (c & 0b01000000) {
          foundBits += 1;
          break;
        }
        if (c & 0b00100000) {
          foundBits += 2;
          break;
        }
        if (c & 0b00010000) {
          foundBits += 3;
          break;
        }
        if (c & 0b00001000) {
          foundBits += 4;
          break;
        }
        if (c & 0b00000100) {
          foundBits += 5;
          break;
        }
        if (c & 0b00000010) {
          foundBits += 6;
          break;
        }
        if (c & 0b00000001) {
          foundBits += 7;
          break;
        }
        if (c === 0) {
          foundBits += 8;
        }

        if (foundBits >= this.bits) {
          break;
        }
      }

      if (foundBits >= this.bits) {
        this.proof = digest.toString('hex');
        break;
      }

      this.nonce += 1;
    }

    return cycle;
  }

  public verify(proof: string, nonce: number): boolean {
    if (proof.length !== 64) {
      return false;
    }

    const full_bytes = this.bits % 4 === 0;
    if (full_bytes) {
      if (!proof.startsWith('0'.repeat(this.bits / 4))) {
        return false;
      }
    } else {
      let foundBits = 0;
      for (const c of Buffer.from(proof, 'hex')) {
        const pos = c.toString(2).padStart(8, '0').indexOf('1');
        if (pos === -1) {
          foundBits += 8;
          continue;
        }

        foundBits += pos;
        break;
      }

      if (foundBits < this.bits) {
        return false;
      }
    }

    const inputData = Buffer.concat([
      Buffer.from('FC:'),
      Buffer.from(this.bits.toString()),
      Buffer.from(':'),
      this.data,
      Buffer.from(':'),
      Buffer.from(nonce.toString()),
    ]);

    const hash = createHash('sha256');
    const digest1 = hash.update(inputData.toString()).digest().toString('hex');
    console.log('digest1', digest1);

    const hash2 = createHash('sha256');
    const digest2 = hash2.update(inputData).digest().toString('hex');
    console.log('digest2', digest2);

    return digest1 === proof;
  }
}
