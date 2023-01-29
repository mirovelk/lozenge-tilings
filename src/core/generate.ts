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
  private _pX: number;
  private _pY: number;
  private _pZ: number;

  private data: LozengeTiling = [];

  constructor({ pX, pY, pZ }: LozengeTilingPeriods) {
    this._pX = pX;
    this._pY = pY;
    this._pZ = pZ;
  }

  get pX() {
    return this._pX;
  }

  get pY() {
    return this._pY;
  }

  get pZ() {
    return this._pZ;
  }

  private zP(z: number) {
    return this._pZ > 0 ? z % this._pZ : z;
  }

  private xP(x: number) {
    return this._pX > 0 ? x % this._pX : x;
  }

  get(z: number, x: number) {
    return this.data?.[this.zP(z)]?.[this.xP(x)] ?? 0;
  }

  set(z: number, x: number, value: number) {
    if (!this.data[this.zP(z)]) {
      this.data[this.zP(z)] = [];
    }
    this.data[this.zP(z)][this.xP(x)] = value;
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

function containsBox(
  tiles: IndexSafeLozengeTiling,
  x: number,
  y: number,
  z: number
) {
  // TODO reflect periods

  return tiles.get(z, x) > y;
}

function getPossibleNextTiles(
  tiles: IndexSafeLozengeTiling
): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];

  // TODO reflect periods
  for (let z = 0; z < tiles.zLength() + 1; z++) {
    for (let x = 0; x < tiles.xLength(z) + 1; x++) {
      const y = tiles.get(z, x);

      if (
        (x === 0 || containsBox(tiles, x - 1, y, z)) &&
        (y === 0 || containsBox(tiles, x, y - 1, z)) &&
        (z === 0 || containsBox(tiles, x, y, z - 1))
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
