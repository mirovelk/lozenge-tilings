import {
  selectBoxCountsAverage,
  selectPeriodBoxCount,
} from '../../../redux/features/lozengeTiling/lozengeTilingSlice';
import { useAppSelector } from '../../../redux/store';

function Counters() {
  const totalBoxCount = useAppSelector(selectPeriodBoxCount);
  const boxCountsAverage = useAppSelector(selectBoxCountsAverage);

  return (
    <>
      <div>Count: {totalBoxCount}</div>
      <div>Avg: {boxCountsAverage} </div>
    </>
  );
}

export default Counters;
