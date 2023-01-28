function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export type LozengeTiling = number[][];

function getPossibleNextTiles(tiles: LozengeTiling): Array<[number, number]> {
  const possibleNextTiles: Array<[number, number]> = [];
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (
        (x === 0 || tiles[x - 1][y] > tiles[x][y]) && // is on left edge or has left tile
        (y === 0 || tiles[x][y - 1] > tiles[x][y]) // is on bottom edge or has bottom tile
      ) {
        possibleNextTiles.push([x, y]);
      }
      // TODO can break early
    }
  }
  return possibleNextTiles;
}

export function generateRandomLozengeTiling({
  iterations,
}: {
  iterations: number;
}): LozengeTiling {
  const row = new Array(iterations).fill(0);
  const lozengeTiling: LozengeTiling = new Array(iterations)
    .fill(0)
    .map(() => [...row]);
  lozengeTiling[0][0] = 1;

  for (let i = 0; i < iterations; i++) {
    const possibleNextTiles = getPossibleNextTiles(lozengeTiling);

    const nextTile =
      possibleNextTiles[randomIntFromInterval(0, possibleNextTiles.length - 1)];
    lozengeTiling[nextTile[0]][nextTile[1]] += 1;
  }

  console.log('lozengeTiling :>> ', lozengeTiling);

  return lozengeTiling;
}
