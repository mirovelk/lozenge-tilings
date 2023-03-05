import { atom, useAtom, useAtomValue } from 'jotai';
import { Checkbox, css, FormControlLabel } from '@mui/material';
import { changesDisabledAtom } from '../ProcessingWithProgress';

export const markovChainAtom = atom(true);

function MarkovChainCheckbox() {
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const [markovChain, setMarkovChain] = useAtom(markovChainAtom);

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={markovChain}
          onChange={() => setMarkovChain((prev) => !prev)}
          disabled={changesDisabled}
        />
      }
      css={css`
        margin-right: 0;
      `}
      label="Markov Chain"
    />
  );
}

export default MarkovChainCheckbox;
