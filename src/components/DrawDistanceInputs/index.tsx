import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import ConfigNumberInputWithLabel from '../ConfigNumberInputWithLabel';
import {
  processingAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { css } from '@emotion/react';
import { DrawDistance } from '../../core/lozengeTiling.worker';
import { wallsAtom } from '../MainScene/Walls';
import { boxesAtom } from '../MainScene/Boxes';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';
import { configValidAtom } from '../ConfigurationForm';

function isInputValueValidDrawDistance(value: string) {
  return value !== '' && Number(value) >= 1 && Number.isInteger(Number(value));
}

export const initialDrawDistance = {
  x: 10,
  y: 10,
  z: 10,
};

export const drawDistanceAtom = atom(
  initialDrawDistance,
  async (get, set, drawDistanceUpdate: Partial<DrawDistance>) => {
    const drawDistance = get(drawDistanceAtom);
    const newDrawDistance = { ...drawDistance, ...drawDistanceUpdate };
    set(drawDistanceAtom, newDrawDistance);
    set(startProcessingAtom);
    await lozengeTilingComlink.setDrawDistance(newDrawDistance);
    set(wallsAtom, await lozengeTilingComlink.getWallVoxels());
    set(boxesAtom, await lozengeTilingComlink.getBoxVoxels());
    set(stopProcessingAtom);
  }
);

function PeriodInputs() {
  const processing = useAtomValue(processingAtom);
  const setConfigValid = useSetAtom(configValidAtom);
  const [drawDistance, setDrawDistance] = useAtom(drawDistanceAtom);

  return (
    <div
      css={css`
        display: flex;
        align-items: baseline;
      `}
    >
      <div
        css={css`
          margin: 0 10px 0 30px;
          white-space: nowrap;
        `}
      >
        Draw dist:
      </div>

      <ConfigNumberInputWithLabel
        label="x:"
        initialValue={drawDistance.x}
        inputValueValid={isInputValueValidDrawDistance}
        onValidChange={(x) => {
          setDrawDistance({ x });
        }}
        readOnly={processing}
        inputProps={{
          step: '1',
          min: '1',
        }}
        onValidationChange={setConfigValid}
        css={css`
          margin-right: 10px;
        `}
      />
      <ConfigNumberInputWithLabel
        label="y:"
        initialValue={drawDistance.y}
        inputValueValid={isInputValueValidDrawDistance}
        onValidChange={(y) => {
          setDrawDistance({ y });
        }}
        readOnly={processing}
        inputProps={{
          step: '1',
          min: '1',
        }}
        onValidationChange={setConfigValid}
        css={css`
          margin-right: 10px;
        `}
      />
      <ConfigNumberInputWithLabel
        label="z:"
        initialValue={drawDistance.z}
        inputValueValid={isInputValueValidDrawDistance}
        onValidChange={(z) => {
          setDrawDistance({ z });
        }}
        readOnly={processing}
        inputProps={{
          step: '1',
          min: '1',
        }}
        onValidationChange={setConfigValid}
        css={css`
          margin-right: 10px;
        `}
      />
    </div>
  );
}

export default PeriodInputs;
