import { css, LinearProgress } from '@mui/material';
import { atom, useAtomValue } from 'jotai';

export const processingAtom = atom(false);
export const showProgressAtom = atom(false);

let showProgressTimeout: ReturnType<typeof setTimeout> | null = null;
const processingWithProgressAtom = atom(
  (get) => get(processingAtom) && get(showProgressAtom),
  (_, set, processing: boolean) => {
    if (showProgressTimeout) {
      clearTimeout(showProgressTimeout);
    }
    set(processingAtom, processing);
    if (processing) {
      showProgressTimeout = setTimeout(() => {
        set(showProgressAtom, true);
      }, 1000);
    } else {
      set(showProgressAtom, false);
    }
  }
);
export const startProcessingAtom = atom(null, (_, set) => {
  set(processingWithProgressAtom, true);
});
export const stopProcessingAtom = atom(null, (_, set) => {
  set(processingWithProgressAtom, false);
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
