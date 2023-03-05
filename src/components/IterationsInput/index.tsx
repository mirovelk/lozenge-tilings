import ConfigNumberInputWithLabel from '../ConfigNumberInputWithLabel';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { processingAtom } from '../ProcessingWithProgress';
import { configValidAtom } from '../ConfigurationForm';

function isInputValueValidIterations(value: string) {
  return value !== '' && Number(value) >= 0 && Number.isInteger(Number(value));
}

export const iterationsAtom = atom(10);

function IterationsInput() {
  const setConfigValid = useSetAtom(configValidAtom);

  const processing = useAtomValue(processingAtom);
  const [iterations, setIterations] = useAtom(iterationsAtom);

  return (
    <ConfigNumberInputWithLabel
      label="Iterations:"
      initialValue={iterations}
      inputValueValid={isInputValueValidIterations}
      onValidChange={setIterations}
      readOnly={processing}
      onValidationChange={setConfigValid}
    />
  );
}

export default IterationsInput;
