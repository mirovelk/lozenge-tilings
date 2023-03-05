import { atom, useAtom, useAtomValue } from 'jotai';
import { Checkbox, FormControlLabel } from '@mui/material';
import { processingAtom } from '../ProcessingWithProgress';

export const markovChainAtom = atom(true);

function MarkovChainCheckbox() {
  const processing = useAtomValue(processingAtom);
  const [markovChain, setMarkovChain] = useAtom(markovChainAtom);

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={markovChain}
          onChange={() => setMarkovChain((prev) => !prev)}
          disabled={processing}
        />
      }
      label="Markov Chain"
    />
  );
}

export default MarkovChainCheckbox;
