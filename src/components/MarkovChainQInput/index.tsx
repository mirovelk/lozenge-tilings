import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { markovChainAtom } from '../MarkovChainCheckbox';
import ConfigNumberInputWithLabel from '../ConfigNumberInputWithLabel';
import { processingAtom } from '../ProcessingWithProgress';
import { configValidAtom } from '../ConfigurationForm';

function isInputValueValidQ(value: string) {
  return value !== '' && Number(value) >= 0 && Number(value) <= 1;
}

export const qAtom = atom(0.9);

function MarkovChainQInput() {
  const processing = useAtomValue(processingAtom);
  const markovChain = useAtomValue(markovChainAtom);
  const setConfigValid = useSetAtom(configValidAtom);

  const [q, setQ] = useAtom(qAtom);

  return (
    <ConfigNumberInputWithLabel
      label="q:"
      initialValue={q}
      inputValueValid={isInputValueValidQ}
      disabled={!markovChain}
      readOnly={processing}
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
