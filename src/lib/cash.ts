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

      const input_data = Buffer.concat([
        Buffer.from('FC:'),
        Buffer.from(this.bits.toString()),
        Buffer.from(':'),
        this.data,
        Buffer.from(':'),
        Buffer.from(this.nonce.toString()),
      ]);

      const hash = createHash('sha256');
      const digest = hash.update(input_data).digest();

      let found_bits = 0;
      for (const c of digest) {
        if (c & 0b10000000) {
          break;
        }
        if (c & 0b01000000) {
          found_bits += 1;
          break;
        }
        if (c & 0b00100000) {
          found_bits += 2;
          break;
        }
        if (c & 0b00010000) {
          found_bits += 3;
          break;
        }
        if (c & 0b00001000) {
          found_bits += 4;
          break;
        }
        if (c & 0b00000100) {
          found_bits += 5;
          break;
        }
        if (c & 0b00000010) {
          found_bits += 6;
          break;
        }
        if (c & 0b00000001) {
          found_bits += 7;
          break;
        }
        if (c === 0) {
          found_bits += 8;
        }

        if (found_bits >= this.bits) {
          break;
        }
      }

      if (found_bits >= this.bits) {
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
      let found_bits = 0;
      for (const c of Buffer.from(proof, 'hex')) {
        const pos = c.toString(2).padStart(8, '0').indexOf('1');
        if (pos === -1) {
          found_bits += 8;
          continue;
        }

        found_bits += pos;
        break;
      }

      if (found_bits < this.bits) {
        return false;
      }
    }

    const input_data = Buffer.concat([
      Buffer.from('FC:'),
      Buffer.from(this.bits.toString()),
      Buffer.from(':'),
      this.data,
      Buffer.from(':'),
      Buffer.from(nonce.toString()),
    ]);

    const hash = createHash('sha256');
    const digest = hash.update(input_data).digest().toString('hex');

    return digest === proof;
  }
}
