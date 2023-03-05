import { useCallback } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';

import IterationsInput from '../IterationsInput';
import MarkovChainCheckbox from '../MarkovChainCheckbox';
import MarkovChainQInput from '../MarkovChainQInput';
import { processingAtom } from '../ProcessingWithProgress';
import ResetButton from '../ResetButton';
import AddBoxButton from '../AddBoxButton';
import RemoveBoxButton from '../RemoveBoxButton';
import PeriodInputs from '../PeriodInputs';
import DrawDistanceInputs from '../DrawDistanceInputs';
import GenerateButton, { generateTilingAtom } from '../GenerateButton';
import styled from '@emotion/styled';

const Row = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  white-space: nowrap;

  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;

const Column = styled.div`
  display: flex;
  white-space: nowrap;
  align-items: center;
`;

export const configValidAtom = atom(true);

function ConfigurationForm() {
  const processing = useAtomValue(processingAtom);
  const configValid = useAtomValue(configValidAtom);

  const generateTiling = useSetAtom(generateTilingAtom);

  const onConfigSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (configValid && !processing) {
        await generateTiling();
      }
    },
    [configValid, generateTiling, processing]
  );

  return (
    <form onSubmit={onConfigSubmit}>
      <Row>
        <Column>
          <IterationsInput />
          <MarkovChainCheckbox />
          <MarkovChainQInput />
        </Column>
        <Column>
          <ResetButton />
          <RemoveBoxButton />
          <AddBoxButton />
          <GenerateButton />
        </Column>
      </Row>
      <Row>
        <Column>
          <PeriodInputs />
        </Column>
        <Column>
          <DrawDistanceInputs />
        </Column>
      </Row>
    </form>
  );
}

export default ConfigurationForm;
