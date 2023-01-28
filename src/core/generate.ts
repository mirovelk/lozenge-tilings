function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export type LozengeTiling = number[][];

class IndexSafeLozengeTiling {
  private data: LozengeTiling = [];

  get(x: number, y: number) {
    return this.data?.[y]?.[x] ?? 0;
  }

  set(x: number, y: number, value: number) {
    if (!this.data[y]) {
      this.data[y] = [];
    }
    this.data[y][x] = value;
  }

  rowCount() {
    return this.data.length;
  }

  rowLength(rowIndex: number) {
    return this.data[rowIndex]?.length ?? 0;
  }

  getData() {
    return this.data;
  }
}

function getPossibleNextTiles(
  tiles: IndexSafeLozengeTiling
): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];

  for (let y = 0; y < tiles.rowCount() + 1; y++) {
    for (let x = 0; x < tiles.rowLength(y) + 1; x++) {
      if (
        (x === 0 || tiles.get(x - 1, y) > tiles.get(x, y)) && // is on left edge or has left tile
        (y === 0 || tiles.get(x, y - 1) > tiles.get(x, y)) // is on bottom edge or has bottom tile
      ) {
        possibleNextTiles.push([x, y]);
      }
    }
  }
  return possibleNextTiles;
}

export function generateRandomLozengeTiling({
  iterations,
}: {
  iterations: number;
}): LozengeTiling {
  const lozengeTiling = new IndexSafeLozengeTiling();

  for (let i = 0; i < iterations; i++) {
    const possibleNextTiles = getPossibleNextTiles(lozengeTiling);

    const [x, y] =
      possibleNextTiles[randomIntFromInterval(0, possibleNextTiles.length - 1)];
    lozengeTiling.set(x, y, lozengeTiling.get(x, y) + 1);
  }

  return lozengeTiling.getData();
}
