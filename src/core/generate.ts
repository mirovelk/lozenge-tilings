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
// periodicity [x,y,z] ~ [x-xShift, y-yShift, z+zHeight]
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

  getZ(x: number, y: number) {
    return this.data?.[x]?.[y] ?? 0;
  }

  setZ(x: number, y: number, z: number) {
    if (!this.data[x]) {
      this.data[x] = [];
    }
    this.data[x][y] = z;
  }

  lengthX() {
    return this.data.length;
  }

  lengthY(x: number) {
    return this.data[x]?.length ?? 0;
  }

  isBox(x: number, y: number, z: number) {
    return this.getZ(x, y) > z;
  }

  getData() {
    return this.data;
  }
}

function getPossibleNextTiles(
  tiles: IndexSafeLozengeTiling
): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];

  // TODO +1 will not work well with periodicity
  for (let x = 0; x < tiles.lengthX() + 1; x++) {
    for (let y = 0; y < tiles.lengthY(x) + 1; y++) {
      const z = tiles.getZ(x, y);

      if (
        (x === 0 || tiles.isBox(x - 1, y, z)) &&
        (y === 0 || tiles.isBox(x, y - 1, z)) &&
        (z === 0 || tiles.isBox(x, y, z - 1))
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

    const [x, y] =
      possibleNextTiles[randomIntFromInterval(0, possibleNextTiles.length - 1)];

    lozengeTiling.setZ(x, y, lozengeTiling.getZ(x, y) + 1);
  }

  console.log('lozengeTiling.getData() :>> ', lozengeTiling.getData());
  return lozengeTiling.getData();
}
