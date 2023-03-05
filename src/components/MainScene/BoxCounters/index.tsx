import { atom, useAtomValue } from 'jotai';

export const boxCountsAtom = atom<number[]>([]);
export const totalBoxCountAtom = atom((get) => {
  const boxCounts = get(boxCountsAtom);
  return boxCounts.length > 0 ? boxCounts[boxCounts.length - 1] : 0;
});
export const boxCountsAverageAtom = atom((get) => {
  const boxCounts = get(boxCountsAtom);
  if (boxCounts.length === 0) {
    return 0;
  }
  const sum = boxCounts.reduce((a, b) => a + b, 0);
  return sum / boxCounts.length;
});
export const canRemoveBoxAtom = atom((get) => {
  const boxCounts = get(boxCountsAtom);
  return boxCounts.length > 0 && boxCounts[0] > 0;
});

function BoxCounters() {
  const totalBoxCount = useAtomValue(totalBoxCountAtom);
  const boxCountsAverage = useAtomValue(boxCountsAverageAtom);

  return (
    <>
      <div>Count: {totalBoxCount}</div>
      <div>Avg: {boxCountsAverage} </div>
    </>
  );
}

export default BoxCounters;
