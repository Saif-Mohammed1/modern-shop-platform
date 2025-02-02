// @types/crypto.d.ts
declare module "crypto" {
  interface ScryptOptions {
    cost?: number;
    blockSize?: number;
    parallelization?: number;
    maxmem?: number;
  }

  function scryptSync(
    password: BinaryLike,
    salt: BinaryLike,
    keylen: number,
    options?: ScryptOptions
  ): Buffer;
}
