import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Button, css } from '@mui/material';
import {
  processingAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { canRemoveBoxAtom } from '../MainScene/BoxCounters';
import { Remove } from '@mui/icons-material';
import { boxesAtom } from '../MainScene/Boxes';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';

export const removeBoxAtom = atom(null, async (_, set) => {
  set(startProcessingAtom);
  await lozengeTilingComlink.removeRandomBox();
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

function AddBoxButton() {
  const processing = useAtomValue(processingAtom);
  const removeBox = useSetAtom(removeBoxAtom);
  const canRemoveBox = useAtomValue(canRemoveBoxAtom);

  return (
    <Button
      variant="outlined"
      disabled={!canRemoveBox || processing}
      onClick={removeBox}
      css={css`
        margin-right: 10px;
      `}
    >
      <Remove />
    </Button>
  );
}

export default AddBoxButton;
