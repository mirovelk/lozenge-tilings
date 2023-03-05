import { css, LinearProgress } from '@mui/material';
import { atom, useAtomValue } from 'jotai';

export const changesDisabledAtom = atom(false);
export const showProgressAtom = atom(false);

let showProgressTimeout: ReturnType<typeof setTimeout> | undefined;

const delayedProgressAtom = atom(
  (get) => get(changesDisabledAtom) && get(showProgressAtom),
  (_, set, showProgress: boolean) => {
    if (showProgressTimeout) {
      clearTimeout(showProgressTimeout);
    }
    set(changesDisabledAtom, showProgress);
    if (showProgress) {
      showProgressTimeout = setTimeout(() => {
        set(showProgressAtom, true);
      }, 1000);
    } else {
      set(showProgressAtom, false);
    }
  }
);
export const startProcessingAtom = atom(null, (_, set) => {
  set(delayedProgressAtom, true);
});
export const stopProcessingAtom = atom(null, (_, set) => {
  set(delayedProgressAtom, false);
});

function ProcessingWithProgress() {
  const showProgress = useAtomValue(showProgressAtom);

  return (
    <div
      css={css`
        height: 4px;
      `}
    >
      {showProgress && <LinearProgress />}
    </div>
  );
}

export default ProcessingWithProgress;
