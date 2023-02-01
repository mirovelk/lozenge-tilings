function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface LozengeTilingPeriods {
  xShift: number;
  yShift: number;
  zHeight: number;
}

type Voxel = [number, number, number];

//    z
//    |
//    +-- y
//   /
//  x
// 2D array of numbers ([x][y] axis), where each number represents the height of a column ([z] axis)
// periodicity [x,y,z] ~ [x-xShift, y-yShift, z+zHeight]

class IndexSafeLozengeTiling {
  private xShift: number;
  private yShift: number;
  private zHeight: number;

  private data: number[][] = [];

  constructor({ xShift, yShift, zHeight }: LozengeTilingPeriods) {
    this.xShift = xShift;
    this.yShift = yShift;
    this.zHeight = zHeight;
  }

  public getZ(x: number, y: number) {
    return this.data?.[x]?.[y] ?? 0;
  }

  public setZ(x: number, y: number, z: number) {
    if (!this.data[x]) {
      this.data[x] = [];
    }
    this.data[x][y] = z;
  }

  public lengthX() {
    return this.xShift > 0 ? this.xShift : this.data.length + 1;
  }

  public lengthY(x: number) {
    return this.yShift > 0 ? this.yShift : (this.data[x]?.length ?? 0) + 1;
  }

  public isBox(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.normalize(x, y, z);
    return this.getZ(nx, ny) >= nz;
  }

  public getVoxels() {
    const repetitions = 5;

    const maxX = this.lengthX();
    const maxY = Math.max(...this.data.map((row) => row.length));
    const maxZ = Math.max(
      ...this.data.map((row) => Math.max(...row.map((z) => z ?? 0)))
    );

    const xWidth = maxX * repetitions;
    const yWidth = maxY * repetitions;
    const zHeight = maxZ * repetitions;

    const voxels: Voxel[] = [];

    for (let x = 0; x < xWidth; x++) {
      for (let y = 0; y < yWidth; y++) {
        for (let z = 1; z < zHeight; z++) {
          if (this.isBox(x, y, z)) {
            voxels.push([x, y, z - 1]);
          }
        }
      }
    }

    return voxels;
  }

  //normalize(x,y,z): (x,y,z) - (y div yShift)(xShift,yShift,-zHeight)
  private normalize(x: number, y: number, z: number) {
    if (this.xShift === 0 && this.yShift === 0) {
      return [x, y, z];
    }
    const shift =
      this.xShift > 0
        ? Math.floor(x / this.xShift)
        : Math.floor(y / this.yShift);

    return [
      x - shift * this.xShift,
      y - shift * this.yShift,
      z + shift * this.zHeight,
    ];
  }

  public logData() {
    console.log(this.data);
  }
}

function getPossibleNextTiles(
  tiles: IndexSafeLozengeTiling
): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];

  for (let x = 0; x < tiles.lengthX(); x++) {
    for (let y = 0; y < tiles.lengthY(x); y++) {
      const newZ = tiles.getZ(x, y) + 1; // add 1 to simulate potential box position

      if (
        (x === 0 || tiles.isBox(x - 1, y, newZ)) && // box behind left
        (y === 0 || tiles.isBox(x, y - 1, newZ)) && // box behind right
        (newZ === 0 || tiles.isBox(x, y, newZ - 1)) // box bottom
      ) {
        possibleNextTiles.push([x, y]);
      }
    }
  }
  return possibleNextTiles;
}

export function generateRandomLozengeTilingVoxels({
  iterations,
  periods,
}: {
  iterations: number;
  periods: LozengeTilingPeriods;
}): Voxel[] {
  const lozengeTiling = new IndexSafeLozengeTiling(periods);

  for (let i = 0; i < iterations; i++) {
    const possibleNextTiles = getPossibleNextTiles(lozengeTiling);

    const [x, y] =
      possibleNextTiles[randomIntFromInterval(0, possibleNextTiles.length - 1)];

    lozengeTiling.setZ(x, y, lozengeTiling.getZ(x, y) + 1);
  }

  lozengeTiling.logData();

  return lozengeTiling.getVoxels();
}
