import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { markovChainAtom } from '../MarkovChainCheckbox';
import ConfigNumberInputWithLabel from '../ConfigNumberInputWithLabel';
import { changesDisabledAtom } from '../ProcessingWithProgress';
import { configValidAtom } from '../ConfigurationForm';

function isInputValueValidQ(value: string) {
  return value !== '' && Number(value) >= 0 && Number(value) <= 1;
}

export const qAtom = atom(0.9);

function MarkovChainQInput() {
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const markovChain = useAtomValue(markovChainAtom);
  const setConfigValid = useSetAtom(configValidAtom);

  const [q, setQ] = useAtom(qAtom);

  return (
    <ConfigNumberInputWithLabel
      label="q:"
      initialValue={q}
      inputValueValid={isInputValueValidQ}
      disabled={!markovChain}
      readOnly={changesDisabled}
      onValidChange={setQ}
      onValidationChange={setConfigValid}
      inputProps={{
        step: '0.001',
        min: '0',
        max: '1',
      }}
    />
  );
}

export default MarkovChainQInput;
