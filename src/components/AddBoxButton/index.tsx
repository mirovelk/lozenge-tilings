import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Button, css } from '@mui/material';
import {
  processingAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { Add } from '@mui/icons-material';
import { boxesAtom } from '../MainScene/Boxes';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';

export const addBoxAtom = atom(null, async (_, set) => {
  set(startProcessingAtom);
  await lozengeTilingComlink.addRandomBox();
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

function AddBoxButton() {
  const processing = useAtomValue(processingAtom);
  const addBox = useSetAtom(addBoxAtom);

  return (
    <Button
      variant="outlined"
      css={css`
        margin-right: 10px;
      `}
      disabled={processing}
      onClick={addBox}
    >
      <Add />
    </Button>
  );
}

export default AddBoxButton;
