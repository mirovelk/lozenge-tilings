import { useAtom } from 'jotai';
import { boxCountsAverageAtom, totalBoxCountAtom } from '../../../appState';

function Counters() {
  const totalBoxCount = useAtom(totalBoxCountAtom);
  const boxCountsAverage = useAtom(boxCountsAverageAtom);

  return (
    <>
      <div>Count: {totalBoxCount}</div>
      <div>Avg: {boxCountsAverage} </div>
    </>
  );
}

export default Counters;
