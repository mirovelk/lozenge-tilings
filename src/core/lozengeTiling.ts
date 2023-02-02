import { Vector3Tuple } from 'three';
function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface LozengeTilingPeriods {
  xShift: number;
  yShift: number;
  zHeight: number; // TODO rename to zShift
}

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

  public getHeight(x: number, y: number) {
    return this.data?.[x]?.[y] ?? 0;
  }

  public incrementHeight(x: number, y: number) {
    if (!this.data[x]) {
      this.data[x] = [];
    }
    if (!this.data[x][y]) {
      this.data[x][y] = 0;
    }
    this.data[x][y] += 1;
  }

  public isBox(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.normalize(x, y, z);
    return this.getHeight(nx, ny) > nz; // TODO is this correct?
  }

  public getPossibleNextTiles(): Array<[number, number]> {
    const possibleNextTiles: Array<[number, number]> = [];

    for (
      let x = 0;
      x < (this.xShift > 0 ? this.xShift : this.data.length + 1);
      x++
    ) {
      for (
        let y = 0;
        y < (this.yShift > 0 ? this.yShift : (this.data[x]?.length ?? 0) + 1);
        y++
      ) {
        const newZ = this.getHeight(x, y); // height === 1 is z === 0 with a box

        if (
          (x === 0 || this.isBox(x - 1, y, newZ)) && // box behind left
          (y === 0 || this.isBox(x, y - 1, newZ)) && // box behind right
          (newZ === 0 || !this.isBox(x, y, newZ)) // NO box in tested position // TODO is this corect?
        ) {
          possibleNextTiles.push([x, y]);
        }
      }
    }
    return possibleNextTiles;
  }

  public getVoxels() {
    const repetitions = 3;

    const maxX = this.xShift > 0 ? this.xShift : this.data.length;
    const maxY =
      this.yShift > 0
        ? this.yShift
        : Math.max(...this.data.map((row) => row.length));
    const maxZ =
      this.zHeight > 0
        ? this.zHeight
        : Math.max(
            ...this.data.map((row) => Math.max(...row.map((z) => z ?? 0)))
          );

    const xWidth = maxX * repetitions;
    const yWidth = maxY * repetitions;
    const zHeight = maxZ * repetitions;

    const voxels: Vector3Tuple[] = [];

    for (let x = 0; x < xWidth; x++) {
      for (let y = 0; y < yWidth; y++) {
        for (let z = 0; z < zHeight; z++) {
          if (this.isBox(x, y, z)) {
            voxels.push([x, y, z]);
          }
        }
      }
    }

    return voxels;
  }

  //normalize(x,y,z): (x,y,z) - (y div yShift)(xShift,yShift,-zHeight) // TODO really "-zHeight"?
  private normalize(x: number, y: number, z: number) {
    const xShift = this.xShift > 0 ? Math.floor(x / this.xShift) : 0;
    const yShift = this.yShift > 0 ? Math.floor(y / this.yShift) : 0;
    const zHeight = this.zHeight > 0 ? Math.floor(z / this.zHeight) : 0;

    return [
      x - xShift * this.xShift,
      y - yShift * this.yShift,
      z - zHeight * this.zHeight, // TODO really "+"?
    ];
  }

  public logData() {
    console.log(this.data);
  }

  public getData() {
    return this.data;
  }
}

export function generateRandomLozengeTiling({
  iterations,
  periods,
}: {
  iterations: number;
  periods: LozengeTilingPeriods;
}) {
  const lozengeTiling = new IndexSafeLozengeTiling(periods);

  for (let i = 0; i < iterations; i++) {
    const possibleNextTiles = lozengeTiling.getPossibleNextTiles();

    const [x, y] =
      possibleNextTiles[randomIntFromInterval(0, possibleNextTiles.length - 1)];

    lozengeTiling.incrementHeight(x, y);
  }

  lozengeTiling.logData();

  return lozengeTiling.getVoxels();
}
