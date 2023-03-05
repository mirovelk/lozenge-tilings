import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import ConfigNumberInputWithLabel from '../ConfigNumberInputWithLabel';
import {
  changesDisabledAtom,
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
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const setConfigValid = useSetAtom(configValidAtom);
  const [drawDistance, setDrawDistance] = useAtom(drawDistanceAtom);

  return (
    <div
      css={css`
        display: flex;
        align-items: baseline;
        gap: 10px;
      `}
    >
      <div>Draw dist:</div>
      <div
        css={css`
          display: flex;
          gap: 20px;
        `}
      >
        <ConfigNumberInputWithLabel
          label="x:"
          initialValue={drawDistance.x}
          inputValueValid={isInputValueValidDrawDistance}
          onValidChange={(x) => {
            setDrawDistance({ x });
          }}
          readOnly={changesDisabled}
          inputProps={{
            step: '1',
            min: '1',
          }}
          onValidationChange={setConfigValid}
        />
        <ConfigNumberInputWithLabel
          label="y:"
          initialValue={drawDistance.y}
          inputValueValid={isInputValueValidDrawDistance}
          onValidChange={(y) => {
            setDrawDistance({ y });
          }}
          readOnly={changesDisabled}
          inputProps={{
            step: '1',
            min: '1',
          }}
          onValidationChange={setConfigValid}
        />
        <ConfigNumberInputWithLabel
          label="z:"
          initialValue={drawDistance.z}
          inputValueValid={isInputValueValidDrawDistance}
          onValidChange={(z) => {
            setDrawDistance({ z });
          }}
          readOnly={changesDisabled}
          inputProps={{
            step: '1',
            min: '1',
          }}
          onValidationChange={setConfigValid}
        />
      </div>
    </div>
  );
}

export default PeriodInputs;
