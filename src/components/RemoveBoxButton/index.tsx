import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Button } from '@mui/material';
import {
  changesDisabledAtom,
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
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const removeBox = useSetAtom(removeBoxAtom);
  const canRemoveBox = useAtomValue(canRemoveBoxAtom);

  return (
    <Button
      variant="outlined"
      disabled={!canRemoveBox || changesDisabled}
      onClick={removeBox}
    >
      <Remove />
    </Button>
  );
}

export default AddBoxButton;
