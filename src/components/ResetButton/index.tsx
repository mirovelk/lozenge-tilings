import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Button, css } from '@mui/material';
import {
  processingAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { boxCountsAtom } from '../MainScene/BoxCounters';
import { boxesAtom } from '../MainScene/Boxes';
import { wallsAtom } from '../MainScene/Walls';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';

export const resetAtom = atom(null, async (get, set) => {
  set(startProcessingAtom);
  await lozengeTilingComlink.reset();
  set(boxesAtom, []);
  set(boxCountsAtom, []);
  set(wallsAtom, await lozengeTilingComlink.getWallVoxels());
  set(stopProcessingAtom);
});

function ResetButton() {
  const processing = useAtomValue(processingAtom);
  const reset = useSetAtom(resetAtom);

  return (
    <Button
      variant="outlined"
      color="error"
      disabled={processing}
      onClick={reset}
      css={css`
        margin-right: 10px;
      `}
    >
      Reset
    </Button>
  );
}

export default ResetButton;
