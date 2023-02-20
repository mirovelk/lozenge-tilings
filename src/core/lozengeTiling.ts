import { Vector3Tuple } from 'three';
import { withDurationLogging } from '../util/benchmark';

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Vector3TupleSet {
  private vectorList: Vector3Tuple[] = [];

  constructor(vectorList: Vector3Tuple[] = []) {
    this.vectorList.push(...vectorList);
  }

  private vectorsEqual(a: Vector3Tuple, b: Vector3Tuple) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  public has(vector: Vector3Tuple): boolean {
    for (let i = 0; i < this.vectorList.length; i++) {
      if (this.vectorsEqual(this.vectorList[i], vector)) {
        return true;
      }
    }
    return false;
  }

  public add(vector: Vector3Tuple): void {
    if (!this.has(vector)) {
      this.vectorList.push(vector);
    }
  }

  public delete(vector: Vector3Tuple): boolean {
    for (let i = 0; i < this.vectorList.length; i++) {
      if (this.vectorsEqual(this.vectorList[i], vector)) {
        this.vectorList.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  public getRandom(): Vector3Tuple {
    return this.vectorList[
      randomIntFromInterval(0, this.vectorList.length - 1)
    ];
  }

  public size(): number {
    return this.vectorList.length;
  }
}

class NumberMap {
  private data: Map<number, number>;

  constructor() {
    this.data = new Map<number, number>();
  }

  private getKey(x: number, y: number): number {
    if (x < -32768 || x > 32767 || y < -32768 || y > 32767) {
      throw new Error('x and y must be between -32768 and 32767');
    }
    return (x << 16) | y;
  }

  public get(x: number, y: number): number {
    const key = this.getKey(x, y);
    return this.data.get(key) ?? -1;
  }

  public set(x: number, y: number, value: number): void {
    const key = this.getKey(x, y);
    if (value === -1) {
      this.data.delete(key);
    } else {
      this.data.set(key, value);
    }
  }

  public clear(): void {
    this.data.clear();
  }

  public size(): number {
    return this.data.size;
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
  private data = new NumberMap();
  private drawDistance: number;

  private periods: LozengeTilingPeriods;
  private addableBoxes: Vector3TupleSet = new Vector3TupleSet([[0, 0, 0]]);
  private removableBoxes: Vector3TupleSet = new Vector3TupleSet([]);

  constructor(initialPeriods: LozengeTilingPeriods, drawDistance: number) {
    this.periods = initialPeriods;
    this.drawDistance = drawDistance;
  }

  private reset() {
    this.data.clear();
    this.addableBoxes = new Vector3TupleSet([[0, 0, 0]]);
    this.removableBoxes = new Vector3TupleSet([]);
  }

  public setPeriods(periods: Partial<LozengeTilingPeriods>) {
    this.periods = { ...this.periods, ...periods };
    // reset other data, no longer valid with new periods
    this.reset();
  }

  public setDrawDistance(drawDistance: number) {
    this.drawDistance = drawDistance;
  }

  private addAddableBox(x: number, y: number, z: number) {
    this.addableBoxes.add(this.normalize(x, y, z));
  }

  private removeAddableBox(x: number, y: number, z: number) {
    this.addableBoxes.delete(this.normalize(x, y, z));
  }

  private addRemovableBox(x: number, y: number, z: number) {
    this.removableBoxes.add(this.normalize(x, y, z));
  }

  private removeRemovableBox(x: number, y: number, z: number) {
    this.removableBoxes.delete(this.normalize(x, y, z));
  }

  private getHeight(x: number, y: number) {
    const [nx, ny] = this.normalize(x, y, 0);
    const savedHeight = this.data.get(nx, ny);
    const { xShift, yShift, zHeight } = this.periods;

    if (yShift >= xShift) {
      return nx >= 0
        ? savedHeight
        : savedHeight + zHeight * (Math.floor((-nx - 1) / xShift) + 1);
    } else {
      return ny >= 0
        ? savedHeight
        : savedHeight + zHeight * (Math.floor((-ny - 1) / yShift) + 1);
    }
  }

  private incrementHeight(x: number, y: number) {
    const [nx, ny] = this.normalize(x, y, 0);

    const prevSavedHeight = this.data.get(nx, ny);

    this.data.set(nx, ny, prevSavedHeight + 1);
  }

  private decrementHeight(x: number, y: number) {
    const [nx, ny] = this.normalize(x, y, 0);

    const prevSavedHeight = this.data.get(nx, ny);
    if (prevSavedHeight < 0) {
      throw new Error(`height is already -1 or less: ${prevSavedHeight}`);
    }

    this.data.set(nx, ny, prevSavedHeight - 1);
  }

  private isWall(x: number, y: number, z: number) {
    if (this.periods.xShift === 0 && this.periods.yShift === 0) {
      return x < 0 || y < 0 || z < 0;
    }

    const [nx, ny, nz] = this.normalize(x, y, z);

    return (
      nz < 0 ||
      (this.periods.yShift >= this.periods.xShift
        ? nx < -Math.floor(nz / this.periods.zHeight) * this.periods.xShift
        : ny < -Math.floor(nz / this.periods.zHeight) * this.periods.yShift)
    );
  }

  private isBox(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.normalize(x, y, z);
    return !this.isWall(x, y, z) && this.getHeight(nx, ny) >= nz;
  }

  public isWallOrBox(x: number, y: number, z: number) {
    return this.isWall(x, y, z) || this.isBox(x, y, z);
  }

  private canAddBox(x: number, y: number, z: number) {
    if (
      this.periods.xShift === 0 &&
      this.periods.yShift === 0 &&
      z > this.periods.zHeight - 1
    ) {
      // special case, only height is restricted
      return false;
    }

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
      this.removeAddableBox(nx, ny, nz); // can't be added again
      this.addRemovableBox(nx, ny, nz); // can be removed

      // update addable boxes
      if (this.canAddBox(nx + 1, ny, nz)) {
        this.addAddableBox(x + 1, y, z);
      }
      if (this.canAddBox(nx, ny + 1, nz)) {
        this.addAddableBox(x, y + 1, z);
      }
      if (this.canAddBox(nx, ny, nz + 1)) {
        this.addAddableBox(x, y, z + 1);
      }

      // update removable boxes
      if (!this.canRemoveBox(x - 1, y, z)) {
        this.removeRemovableBox(x - 1, y, z);
      }
      if (!this.canRemoveBox(x, y - 1, z)) {
        this.removeRemovableBox(x, y - 1, z);
      }
      if (!this.canRemoveBox(x, y, z - 1)) {
        this.removeRemovableBox(x, y, z - 1);
      }
    }
  }

  public removeBox(x: number, y: number, z: number) {
    if (this.canRemoveBox(x, y, z)) {
      const [nx, ny, nz] = this.normalize(x, y, z);

      // remove box
      this.decrementHeight(nx, ny);
      // just removed box
      this.addAddableBox(nx, ny, nz); // can be added again
      this.removeRemovableBox(nx, ny, nz); // can't be removed again

      // update addable boxes
      if (!this.canAddBox(nx + 1, ny, nz)) {
        this.removeAddableBox(x + 1, y, z);
      }
      if (!this.canAddBox(nx, ny + 1, nz)) {
        this.removeAddableBox(x, y + 1, z);
      }
      if (!this.canAddBox(nx, ny, nz + 1)) {
        this.removeAddableBox(x, y, z + 1);
      }

      // update removable boxes
      if (this.canRemoveBox(x - 1, y, z)) {
        this.addRemovableBox(x - 1, y, z);
      }
      if (this.canRemoveBox(x, y - 1, z)) {
        this.addRemovableBox(x, y - 1, z);
      }
      if (this.canRemoveBox(x, y, z - 1)) {
        this.addRemovableBox(x, y, z - 1);
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
    const defaultWidth = 30;
    const drawDistance = this.drawDistance;
    const { xShift, yShift, zHeight } = this.periods;
    const xHalfWidth = xShift > 0 ? xShift * drawDistance : defaultWidth;
    const yHalfWidth = yShift > 0 ? yShift * drawDistance : defaultWidth;
    const zHalfWidth = zHeight > 0 ? zHeight * drawDistance : defaultWidth;

    return {
      bondX: {
        start: xShift === 0 ? -1 : -xHalfWidth,
        end: +xHalfWidth,
      },
      bondY: {
        start: yShift === 0 ? -1 : -yHalfWidth,
        end: +yHalfWidth,
      },
      bondZ: {
        start: zHeight === 0 ? -1 : -zHalfWidth,
        end: +zHalfWidth,
      },
    };
  }

  private getVoxels(match: (x: number, y: number, z: number) => boolean) {
    const voxels: Vector3Tuple[] = [];
    const { bondX, bondY, bondZ } = this.getVoxelBoundaries();

    for (let x = bondX.start; x < bondX.end; x++) {
      for (let y = bondY.start; y < bondY.end; y++) {
        for (let z = bondZ.start; z < bondZ.end; z++) {
          if (match(x, y, z)) {
            voxels.push([x, y, z]);
          }
        }
      }
    }

    return voxels;
  }

  public getWallVoxels() {
    return withDurationLogging('wall', () => {
      return this.getVoxels(this.isWall.bind(this));
    });
  }

  public getBoxVoxels() {
    return withDurationLogging('boxes', () => {
      return this.getVoxels(this.isBox.bind(this));
    });
  }

  public getPeriodBoxCount() {
    return this.data.size();
  }

  //normalize(x,y,z): (x,y,z) - (y div yShift)(xShift,yShift,-zHeight)
  private normalize(x: number, y: number, z: number): Vector3Tuple {
    if (this.periods.xShift === 0 && this.periods.yShift === 0) {
      return [x, y, z];
    }

    // xShift !== 0 || yShift !=== 0
    const shift =
      this.periods.yShift >= this.periods.xShift
        ? Math.floor(y / this.periods.yShift)
        : Math.floor(x / this.periods.xShift);

    const normalized: Vector3Tuple = [
      x - shift * this.periods.xShift,
      y - shift * this.periods.yShift,
      z + shift * this.periods.zHeight,
    ];

    return normalized;
  }

  public generateByAddingOnly(iterations: number) {
    withDurationLogging('generateByAddingOnly', () => {
      for (let i = 0; i < iterations; i++) {
        this.addRandomBox();
      }
    });
  }

  public generateWithMarkovChain(iterations: number, q: number) {
    withDurationLogging(
      `generateWithMarkovChain with ${iterations} iterations`,
      () => {
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
    );
  }
}
