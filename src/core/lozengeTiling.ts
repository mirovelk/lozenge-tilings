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

  public addableBoxes: Vector3Tuple[] = [[0, 0, 0]]; // TODO private + getter or move gneration inside this class

  // TODO use Set instead of array?
  private addAddableBoxNotInAddableBoxes(x: number, y: number, z: number) {
    if (
      this.addableBoxes.some(([bx, by, bz]) => bx === x && by === y && bz === z)
    ) {
      return;
    }
    this.addableBoxes.push([x, y, z]);
  }

  constructor({ xShift, yShift, zHeight }: LozengeTilingPeriods) {
    this.xShift = xShift;
    this.yShift = yShift;
    this.zHeight = zHeight;
  }

  public getHeight(x: number, y: number) {
    return this.data?.[x]?.[y] ?? -1;
  }

  public incrementHeight(x: number, y: number) {
    if (this.data.length < x + 1) {
      this.data[x] = [];
    }
    if (this.data[x].length < y + 1) {
      this.data[x][y] = -1;
    }
    this.data[x][y] += 1;
  }

  public isBox(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.normalize(x, y, z);
    if (nx < 0) {
      return true;
    }
    return this.getHeight(nx, ny) >= nz;
  }

  private canAddBox(x: number, y: number, z: number) {
    return (
      // looking from y
      this.isBox(x - 1, y, z) && // box right
      this.isBox(x, y - 1, z) && // box behind
      this.isBox(x, y, z - 1) && // box below
      !this.isBox(x, y, z) // NO box in tested position
    );
  }

  private canRemoveBox(x: number, y: number, z: number) {
    return (
      // looking from y
      !this.isBox(x + 1, y, z) && // box left
      !this.isBox(x, y + 1, z) && // box in front
      !this.isBox(x, y, z + 1) && // box above
      this.isBox(x, y, z) // box in tested position
    );
  }

  public addBox(x: number, y: number, z: number) {
    if (this.canAddBox(x, y, z)) {
      const [nx, ny, nz] = this.normalize(x, y, z);

      this.incrementHeight(nx, ny);

      this.addableBoxes = this.addableBoxes.filter(
        ([bx, by, bz]) => !(bx === nx && by === ny && bz === nz)
      );

      if (this.canAddBox(nx + 1, ny, nz)) {
        const [nnx, nny, nnz] = this.normalize(x + 1, y, z);
        this.addAddableBoxNotInAddableBoxes(nnx, nny, nnz);
      }
      if (this.canAddBox(nx, ny + 1, nz)) {
        const [nnx, nny, nnz] = this.normalize(x, y + 1, z);
        this.addAddableBoxNotInAddableBoxes(nnx, nny, nnz);
      }
      if (this.canAddBox(nx, ny, nz + 1)) {
        const [nnx, nny, nnz] = this.normalize(x, y, z + 1);
        this.addAddableBoxNotInAddableBoxes(nnx, nny, nnz);
      }
    }
  }

  public removeBox(x: number, y: number, z: number) {
    if (this.canRemoveBox(x, y, z)) {
      const [nx, ny, nz] = this.normalize(x, y, z);

      this.data[nx][ny] -= 1;
      this.addAddableBoxNotInAddableBoxes(nx, ny, nz);

      let [nnx, nny, nnz] = this.normalize(x + 1, y, z);
      this.addableBoxes = this.addableBoxes.filter(([bx, by, bz]) => {
        return bx !== nnx || by !== nny || bz !== nnz;
      });

      [nnx, nny, nnz] = this.normalize(x, y + 1, z);
      this.addableBoxes = this.addableBoxes.filter(([bx, by, bz]) => {
        return bx !== nnx || by !== nny || bz !== nnz;
      });

      [nnx, nny, nnz] = this.normalize(x, y, z + 1);
      this.addableBoxes = this.addableBoxes.filter(([bx, by, bz]) => {
        return bx !== nnx || by !== nny || bz !== nnz;
      });
    }
  }

  public getVoxels() {
    // TODO add function to just go through ranges + function to detect the range
    const voxels: Vector3Tuple[] = [];
    const start = -10;
    const end = 10;

    for (let x = start; x < end; x++) {
      for (let y = start; y < end; y++) {
        for (let z = start; z < end; z++) {
          if (this.isBox(x, y, z)) {
            voxels.push([x, y, z]);
          }
        }
      }
    }

    return voxels;
  }

  //normalize(x,y,z): (x,y,z) - (y div yShift)(xShift,yShift,-zHeight)
  private normalize(x: number, y: number, z: number) {
    // yShift < xShift, yShift !== 0
    // xShift !== 0 && yShift !=== 0 // aspon 1 nenulovy
    // (y div yShift)
    const shift = Math.floor(y / this.yShift);

    return [
      x - shift * this.xShift,
      y - shift * this.yShift,
      z + shift * this.zHeight,
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
    const nextBoxIndex = randomIntFromInterval(
      0,
      lozengeTiling.addableBoxes.length - 1
    );
    const [x, y, z] = lozengeTiling.addableBoxes[nextBoxIndex];
    lozengeTiling.addBox(x, y, z);
  }

  lozengeTiling.logData();

  return lozengeTiling.getVoxels();
}
