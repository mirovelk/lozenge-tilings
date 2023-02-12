import { Vector3Tuple } from 'three';

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Vector3TupleSet {
  private arrList: Vector3Tuple[] = [];

  constructor(arrList: Vector3Tuple[] = []) {
    this.arrList.push(...arrList);
  }

  private arraysEqual(a: Vector3Tuple, b: Vector3Tuple) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  public has(arr: Vector3Tuple): boolean {
    for (let i = 0; i < this.arrList.length; i++) {
      if (this.arraysEqual(this.arrList[i], arr)) {
        return true;
      }
    }
    return false;
  }

  public add(arr: Vector3Tuple): void {
    if (!this.has(arr)) {
      this.arrList.push(arr);
    }
  }

  public remove(arr: Vector3Tuple): boolean {
    for (let i = 0; i < this.arrList.length; i++) {
      if (this.arraysEqual(this.arrList[i], arr)) {
        this.arrList.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  public getRandom(): Vector3Tuple {
    return this.arrList[randomIntFromInterval(0, this.arrList.length - 1)];
  }

  public getAll(): Vector3Tuple[] {
    return this.arrList;
  }

  public size(): number {
    return this.arrList.length;
  }
}

export interface LozengeTiling {
  data: number[][];
  addableBoxes: Vector3Tuple[];
  removableBoxes: Vector3Tuple[];
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
// 2D array of numbers ([x][y] axis), where each number represents the height of a column ([z] axis), height -1 means no box in that column
// periodicity [x,y,z] ~ [x-xShift, y-yShift, z+zHeight]
export class PeriodicLozengeTiling {
  private data: number[][] = [];
  private periods: LozengeTilingPeriods;
  private addableBoxes: Vector3TupleSet = new Vector3TupleSet([[0, 0, 0]]);
  private removableBoxes: Vector3TupleSet = new Vector3TupleSet([]);

  constructor(initialPeriods: LozengeTilingPeriods) {
    this.periods = initialPeriods;
  }

  private reset() {
    this.data = [];
    this.addableBoxes = new Vector3TupleSet([[0, 0, 0]]);
    this.removableBoxes = new Vector3TupleSet([]);
  }

  public setPeriods(periods: Partial<LozengeTilingPeriods>) {
    this.periods = { ...this.periods, ...periods };
    // reset other data, no longer valid with new periods
    this.reset();
  }

  private addAddableBox(box: Vector3Tuple) {
    this.addableBoxes.add(this.normalize(...box));
  }

  private removeAddableBox(box: Vector3Tuple) {
    this.addableBoxes.remove(this.normalize(...box));
  }

  private addRemovableBox(box: Vector3Tuple) {
    this.removableBoxes.add(this.normalize(...box));
  }

  private removeRemovableBox(box: Vector3Tuple) {
    this.removableBoxes.remove(this.normalize(...box));
  }

  private getHeight(x: number, y: number) {
    return this.data?.[x]?.[y] ?? -1;
  }

  private initializeHeight(x: number, y: number) {
    if (this.data.length < x + 1) {
      this.data[x] = [];
    }
    if (this.data[x].length < y + 1) {
      this.data[x][y] = -1;
    }
  }

  private incrementHeight(x: number, y: number) {
    this.initializeHeight(x, y);
    this.data[x][y] += 1;
  }

  private decrementHeight(x: number, y: number) {
    this.initializeHeight(x, y);
    this.data[x][y] -= 1;
  }

  private isWall(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.normalize(x, y, z);
    return nx < 0 || ny < 0 || nz < 0;
  }

  private isBox(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.normalize(x, y, z);
    return !this.isWall(x, y, z) && this.getHeight(nx, ny) >= nz;
  }

  public isWallOrBox(x: number, y: number, z: number) {
    return this.isWall(x, y, z) || this.isBox(x, y, z);
  }

  private canAddBox(x: number, y: number, z: number) {
    return (
      !this.isWallOrBox(x, y, z) && // no box in tested position
      // looking from +y
      this.isWallOrBox(x - 1, y, z) && // box or wall to left
      this.isWallOrBox(x, y - 1, z) && // box or wall behind
      this.isWallOrBox(x, y, z - 1) // box or wall below
    );
  }

  private canRemoveBox(x: number, y: number, z: number) {
    return (
      this.isBox(x, y, z) && // box in tested position
      // looking from +y
      !this.isBox(x + 1, y, z) && // no box to right
      !this.isBox(x, y + 1, z) && // no box in front
      !this.isBox(x, y, z + 1) // no box above
    );
  }

  public addBox(x: number, y: number, z: number) {
    if (this.canAddBox(x, y, z)) {
      const [nx, ny, nz] = this.normalize(x, y, z);

      // add box
      this.incrementHeight(nx, ny);
      // just added box
      this.removeAddableBox([nx, ny, nz]); // can't be added again
      this.addRemovableBox([nx, ny, nz]); // can be removed

      // update addable boxes
      if (this.canAddBox(nx + 1, ny, nz)) {
        this.addAddableBox([x + 1, y, z]);
      }
      if (this.canAddBox(nx, ny + 1, nz)) {
        this.addAddableBox([x, y + 1, z]);
      }
      if (this.canAddBox(nx, ny, nz + 1)) {
        this.addAddableBox([x, y, z + 1]);
      }

      // update removable boxes
      if (!this.canRemoveBox(x - 1, y, z)) {
        this.removeRemovableBox([x - 1, y, z]);
      }
      if (!this.canRemoveBox(x, y - 1, z)) {
        this.removeRemovableBox([x, y - 1, z]);
      }
      if (!this.canRemoveBox(x, y, z - 1)) {
        this.removeRemovableBox([x, y, z - 1]);
      }
    }
  }

  public removeBox(x: number, y: number, z: number) {
    if (this.canRemoveBox(x, y, z)) {
      const [nx, ny, nz] = this.normalize(x, y, z);

      // remove box
      this.decrementHeight(nx, ny);
      // just removed box
      this.addAddableBox([nx, ny, nz]); // can be added again
      this.removeRemovableBox([nx, ny, nz]); // can't be removed again

      // update addable boxes
      if (!this.canAddBox(nx + 1, ny, nz)) {
        this.removeAddableBox([x + 1, y, z]);
      }
      if (!this.canAddBox(nx, ny + 1, nz)) {
        this.removeAddableBox([x, y + 1, z]);
      }
      if (!this.canAddBox(nx, ny, nz + 1)) {
        this.removeAddableBox([x, y, z + 1]);
      }

      // update removable boxes
      if (this.canRemoveBox(x - 1, y, z)) {
        this.addRemovableBox([x - 1, y, z]);
      }
      if (this.canRemoveBox(x, y - 1, z)) {
        this.addRemovableBox([x, y - 1, z]);
      }
      if (this.canRemoveBox(x, y, z - 1)) {
        this.addRemovableBox([x, y, z - 1]);
      }
    }
  }

  private getRandomAddableBox() {
    return this.addableBoxes.getRandom();
  }

  private getRandomRemovableBox() {
    return this.removableBoxes.getRandom();
  }

  public addRandomBox() {
    const box = this.getRandomAddableBox();
    if (box) {
      this.addBox(...box);
    }
  }

  private addableBoxesCount() {
    return this.addableBoxes.size();
  }

  private removableBoxesCount() {
    return this.removableBoxes.size();
  }

  public removeRandomBox() {
    const box = this.getRandomRemovableBox();
    if (box) {
      this.removeBox(...box);
    }
  }

  private getVoxelBoundaries() {
    // TODO: calculate boundaries based on data or config
    return {
      start: -10,
      end: 10,
    };
  }

  private getVoxels(match: (x: number, y: number, z: number) => boolean) {
    const voxels: Vector3Tuple[] = [];
    const { start, end } = this.getVoxelBoundaries();

    for (let x = start; x < end; x++) {
      for (let y = start; y < end; y++) {
        for (let z = start; z < end; z++) {
          if (match(x, y, z)) {
            voxels.push([x, y, z]);
          }
        }
      }
    }

    return voxels;
  }

  public getWallVoxels() {
    return this.getVoxels(this.isWall.bind(this));
  }

  public getBoxVoxels() {
    return this.getVoxels(this.isBox.bind(this));
  }

  //normalize(x,y,z): (x,y,z) - (y div yShift)(xShift,yShift,-zHeight)
  private normalize(x: number, y: number, z: number): Vector3Tuple {
    // yShift < xShift, yShift !== 0
    // xShift !== 0 || yShift !=== 0 // aspon 1 nenulovy
    // (y div yShift)
    const shift = Math.floor(y / this.periods.yShift);

    const normalized: Vector3Tuple = [
      x - shift * this.periods.xShift,
      y - shift * this.periods.yShift,
      z + shift * this.periods.zHeight,
    ];

    return normalized;
  }

  public generateByAddingOnly(iterations: number) {
    this.reset();
    for (let i = 0; i < iterations; i++) {
      this.addRandomBox();
    }
  }

  public generateWithMarkovChain(iterations: number, q: number) {
    this.reset();

    for (let i = 0; i < iterations; i++) {
      const rnd1 =
        (Math.log(1 - Math.random()) * -1) / this.addableBoxesCount() / q;
      const rnd2 =
        (Math.log(1 - Math.random()) * -1) / this.removableBoxesCount();

      if (rnd1 < rnd2) {
        this.addRandomBox();
      } else {
        this.removeRandomBox();
      }
    }
  }
}