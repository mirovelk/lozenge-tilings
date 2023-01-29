function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface LozengeTilingPeriods {
  pX: number;
  pY: number;
  pZ: number;
}

//    y
//    |
//    +-- x
//   /
//  z
// 2D array of numbers ([z][x] axis), where each number represents the height of a column ([y])
export type LozengeTiling = number[][];

class IndexSafeLozengeTiling {
  private pX: number;
  private pY: number;
  private pZ: number;

  private data: LozengeTiling = [];

  constructor({ pX, pY, pZ }: LozengeTilingPeriods) {
    this.pX = pX;
    this.pY = pY;
    this.pZ = pZ;
  }

  private zP(z: number) {
    return this.pZ > 0 ? z % this.pZ : z;
  }

  get(z: number, x: number) {
    return this.data?.[this.zP(z)]?.[x] ?? 0;
  }

  set(z: number, x: number, value: number) {
    if (!this.data[this.zP(z)]) {
      this.data[this.zP(z)] = [];
    }
    this.data[z][x] = value;
  }

  zLength() {
    return this.data.length;
  }

  xLength(z: number) {
    return this.data[z]?.length ?? 0;
  }

  getData() {
    return this.data;
  }
}

function getPossibleNextTiles(
  tiles: IndexSafeLozengeTiling
): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];

  for (let z = 0; z < tiles.zLength() + 1; z++) {
    for (let x = 0; x < tiles.xLength(z) + 1; x++) {
      if (
        (x === 0 || tiles.get(z, x - 1) > tiles.get(z, x)) &&
        (z === 0 || tiles.get(z - 1, x) > tiles.get(z, x))
      ) {
        possibleNextTiles.push([z, x]);
      }
    }
  }
  return possibleNextTiles;
}

export function generateRandomLozengeTiling({
  iterations,
  periods,
}: {
  iterations: number;
  periods: LozengeTilingPeriods;
}): LozengeTiling {
  const lozengeTiling = new IndexSafeLozengeTiling(periods);

  for (let i = 0; i < iterations; i++) {
    const possibleNextTiles = getPossibleNextTiles(lozengeTiling);

    const [z, x] =
      possibleNextTiles[randomIntFromInterval(0, possibleNextTiles.length - 1)];
    lozengeTiling.set(z, x, lozengeTiling.get(z, x) + 1);
  }

  return lozengeTiling.getData();
}
