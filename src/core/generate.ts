function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface LozengeTilingPeriods {
  xShift: number;
  yShift: number;
  zHeight: number;
}

//    z
//    |
//    +-- y
//   /
//  x
// 2D array of numbers ([x][y] axis), where each number represents the height of a column ([z] axis)
export type LozengeTiling = number[][];

class IndexSafeLozengeTiling {
  private xShift: number;
  private yShift: number;
  private zHeight: number;

  private data: LozengeTiling = [];

  constructor({ xShift, yShift, zHeight }: LozengeTilingPeriods) {
    this.xShift = xShift;
    this.yShift = yShift;
    this.zHeight = zHeight;
  }

  get(x: number, y: number) {
    return this.data?.[x]?.[y] ?? 0;
  }

  set(x: number, y: number, z: number) {
    if (!this.data[x]) {
      this.data[x] = [];
    }
    this.data[x][y] = z;
  }

  xLength() {
    return this.data.length;
  }

  yLength(x: number) {
    return this.data[x]?.length ?? 0;
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

  return tiles.get(x, y) > z;
}

function getPossibleNextTiles(
  tiles: IndexSafeLozengeTiling
): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];

  // TODO reflect periods
  for (let x = 0; x < tiles.xLength() + 1; x++) {
    for (let y = 0; y < tiles.yLength(x) + 1; y++) {
      const z = tiles.get(x, y);

      if (
        (x === 0 || containsBox(tiles, x - 1, y, z)) &&
        (y === 0 || containsBox(tiles, x, y - 1, z)) &&
        (z === 0 || containsBox(tiles, x, y, z - 1))
      ) {
        possibleNextTiles.push([x, y]);
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

  console.log('lozengeTiling.getData() :>> ', lozengeTiling.getData());
  return lozengeTiling.getData();
}
