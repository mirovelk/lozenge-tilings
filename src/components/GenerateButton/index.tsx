import { atom, useAtomValue } from 'jotai';
import { Button } from '@mui/material';
import {
  changesDisabledAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { iterationsAtom } from '../IterationsInput';
import { qAtom } from '../MarkovChainQInput';
import { markovChainAtom } from '../MarkovChainCheckbox';
import { boxesAtom } from '../MainScene/Boxes';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';
import { configValidAtom } from '../ConfigurationForm';
import { generatingContinuouslyAtom } from '../RunStopButton';

export const generateBussyAtom = atom(false);

const generateWithMarkovChainAtom = atom(null, async (get) => {
  const iterations = get(iterationsAtom);
  const q = get(qAtom);
  await lozengeTilingComlink.generateWithMarkovChain(iterations, q);
});

const generateByAddingOnlyAtom = atom(null, async (get) => {
  const iterations = get(iterationsAtom);
  await lozengeTilingComlink.generateByAddingOnly(iterations);
});

export const generateTilingAtom = atom(
  null,
  async (get, set, delayMs: number | undefined = undefined) => {
    set(generateBussyAtom, true);

    if (delayMs) {
      await new Promise((resolve) => setTimeout(resolve, delayMs)); // pause before updating
    }

    const markovChain = get(markovChainAtom);
    const generatingContinuously = get(generatingContinuouslyAtom);

    if (!generatingContinuously) {
      set(startProcessingAtom);
    }

    if (markovChain) {
      await set(generateWithMarkovChainAtom);
    } else {
      await set(generateByAddingOnlyAtom);
    }
    const boxes = await lozengeTilingComlink.getBoxVoxels();
    await set(boxesAtom, boxes);

    if (!generatingContinuously) {
      set(stopProcessingAtom);
    }

    set(generateBussyAtom, false);
  }
);

function GenerateButton() {
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const configValid = useAtomValue(configValidAtom);

  return (
    <Button
      variant="contained"
      type="submit" // runs generateTiling
      disabled={!configValid || changesDisabled}
    >
      Generate More
    </Button>
  );
}

export default GenerateButton;
