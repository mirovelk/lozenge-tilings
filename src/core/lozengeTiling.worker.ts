import initWasm, {
  PeriodicLozengeTiling as PeriodicLozengeTilingWasm,
} from '../../build/lib';
import * as Comlink from 'comlink';
import { DrawDistance, LozengeTilingPeriods } from './lozengeTiling';
import { Vector3Tuple } from 'three';

export class PeriodicLozengeTilingWorker {
  private lozengeTiling: PeriodicLozengeTilingWasm | null = null;
  private initialPeriods: LozengeTilingPeriods;
  private initialDrawDistance: DrawDistance;

  constructor(periods: LozengeTilingPeriods, drawDistance: DrawDistance) {
    this.initialPeriods = periods;
    this.initialDrawDistance = drawDistance;
  }

  public async init(): Promise<void> {
    await initWasm();

    this.lozengeTiling = new PeriodicLozengeTilingWasm(
      this.initialPeriods.xShift,
      this.initialPeriods.yShift,
      this.initialPeriods.zHeight,
      this.initialDrawDistance.x,
      this.initialDrawDistance.y,
      this.initialDrawDistance.z
    );
  }

  public async getWallVoxels(): Promise<Vector3Tuple[]> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    return this.lozengeTiling.getWallVoxels();
  }

  public async getBoxVoxels(): Promise<Vector3Tuple[]> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    return this.lozengeTiling.getBoxVoxels();
  }

  public async getPeriodBoxCount(): Promise<number> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    return this.lozengeTiling.getPeriodBoxCount();
  }

  public async setPeriods(
    xShift: number,
    yShift: number,
    zHeight: number
  ): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.setPeriods(xShift, yShift, zHeight);
  }

  public async setDrawDistance(x: number, y: number, z: number): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.setDrawDistance(x, y, z);
  }

  public async reset(): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.reset();
  }

  public async generateByAddingOnly(iterations: number): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.generateByAddingOnly(iterations);
  }

  public async generateWithMarkovChain(
    iterations: number,
    q: number
  ): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.generateWithMarkovChain(iterations, q);
  }

  public async addRandomBox(): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.addRandomBox();
  }

  public async removeRandomBox(): Promise<void> {
    if (!this.lozengeTiling) {
      throw new Error('LozengeTiling not initialized');
    }
    this.lozengeTiling.removeRandomBox();
  }
}

Comlink.expose(PeriodicLozengeTilingWorker);
