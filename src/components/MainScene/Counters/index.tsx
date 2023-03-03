import { useMemo } from 'react';

function Counters({ boxCounts }: { boxCounts: number[] }) {
  const totalBoxCount = useMemo(() => {
    return boxCounts.length > 0 ? boxCounts[boxCounts.length - 1] : 0;
  }, [boxCounts]);

  const boxCountsAverage = useMemo(() => {
    if (boxCounts.length === 0) {
      return 0;
    }
    const sum = boxCounts.reduce((a, b) => a + b, 0);
    return sum / boxCounts.length;
  }, [boxCounts]);

  return (
    <>
      <div>Count: {totalBoxCount}</div>
      <div>Avg: {boxCountsAverage} </div>
    </>
  );
}

export default Counters;
