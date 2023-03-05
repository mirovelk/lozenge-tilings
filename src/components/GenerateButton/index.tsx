import { atom, useAtomValue } from 'jotai';
import { Button } from '@mui/material';
import {
  processingAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { iterationsAtom } from '../IterationsInput';
import { qAtom } from '../MarkovChainQInput';
import { markovChainAtom } from '../MarkovChainCheckbox';
import { boxesAtom } from '../MainScene/Boxes';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';
import { configValidAtom } from '../ConfigurationForm';

const generateWithMarkovChainAtom = atom(null, async (get, set) => {
  const iterations = get(iterationsAtom);
  const q = get(qAtom);
  set(startProcessingAtom);
  await lozengeTilingComlink.generateWithMarkovChain(iterations, q);
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

const generateByAddingOnlyAtom = atom(null, async (get, set) => {
  const iterations = get(iterationsAtom);
  set(startProcessingAtom);
  await lozengeTilingComlink.generateByAddingOnly(iterations);
  set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
  set(stopProcessingAtom);
});

export const generateTilingAtom = atom(null, async (get, set) => {
  const markovChain = get(markovChainAtom);
  if (markovChain) {
    set(generateWithMarkovChainAtom);
  } else {
    set(generateByAddingOnlyAtom);
  }
});

function GenerateButton() {
  const processing = useAtomValue(processingAtom);
  const configValid = useAtomValue(configValidAtom);

  return (
    <Button
      variant="contained"
      type="submit" // runs generateTiling
      disabled={!configValid || processing}
    >
      Generate More
    </Button>
  );
}

export default GenerateButton;
