import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import ConfigNumberInputWithLabel from '../ConfigNumberInputWithLabel';
import {
  changesDisabledAtom,
  startProcessingAtom,
  stopProcessingAtom,
} from '../ProcessingWithProgress';
import { css } from '@emotion/react';
import { LozengeTilingPeriods } from '../../core/lozengeTiling.worker';
import { boxesAtom } from '../MainScene/Boxes';
import { wallsAtom } from '../MainScene/Walls';
import { lozengeTilingComlink } from '../../lozengeTilingComlink';
import { configValidAtom } from '../ConfigurationForm';

function isInputValueValidPeriod(value: string) {
  return value !== '' && Number(value) >= 0 && Number.isInteger(Number(value));
}

export const initialPeriods = {
  xShift: 1,
  yShift: 2,
  zHeight: 2,
};

export const periodsAtom = atom(
  initialPeriods,
  async (get, set, periodsUpdate: Partial<LozengeTilingPeriods>) => {
    const periods = get(periodsAtom);
    const newPeriods = { ...periods, ...periodsUpdate };
    set(periodsAtom, newPeriods);
    set(startProcessingAtom);
    await lozengeTilingComlink.setPeriods(newPeriods);
    set(boxesAtom, []);
    set(wallsAtom, await lozengeTilingComlink.getWallVoxels());
    set(stopProcessingAtom);
  }
);

function PeriodInputs() {
  const changesDisabled = useAtomValue(changesDisabledAtom);
  const setConfigValid = useSetAtom(configValidAtom);
  const [periods, setPeriods] = useAtom(periodsAtom);

  return (
    <div
      css={css`
        display: flex;
        align-items: baseline;
        gap: 10px;
      `}
    >
      <div>Periods:</div>
      <div
        css={css`
          display: flex;
          gap: 20px;
        `}
      >
        <ConfigNumberInputWithLabel
          label="xShift:"
          initialValue={periods.xShift}
          inputValueValid={isInputValueValidPeriod}
          onValidChange={(xShift) => {
            setPeriods({ ...periods, xShift });
          }}
          readOnly={changesDisabled}
          inputProps={{
            step: '1',
            min: '0',
          }}
          onValidationChange={setConfigValid}
        />
        <ConfigNumberInputWithLabel
          label="yShift:"
          initialValue={periods.yShift}
          inputValueValid={isInputValueValidPeriod}
          onValidChange={(yShift) => {
            setPeriods({ ...periods, yShift });
          }}
          readOnly={changesDisabled}
          inputProps={{
            step: '1',
            min: '0',
          }}
          onValidationChange={setConfigValid}
        />
        <ConfigNumberInputWithLabel
          label="zHeight:"
          initialValue={periods.zHeight}
          inputValueValid={isInputValueValidPeriod}
          onValidChange={(zHeight) => {
            setPeriods({ ...periods, zHeight });
          }}
          readOnly={changesDisabled}
          inputProps={{
            step: '1',
            min: '0',
          }}
          onValidationChange={setConfigValid}
        />
      </div>
    </div>
  );
}

export default PeriodInputs;
