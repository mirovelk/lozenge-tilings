import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Button } from '@mui/material';
import {
  changesDisabledAtom,
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
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const addBox = useSetAtom(addBoxAtom);

  return (
    <Button variant="outlined" disabled={changesDisabled} onClick={addBox}>
      <Add />
    </Button>
  );
}

export default AddBoxButton;
