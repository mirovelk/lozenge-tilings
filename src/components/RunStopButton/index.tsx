import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Button } from '@mui/material';
import {
  changesDisabledAtom,
  showProgressAtom,
} from '../ProcessingWithProgress';
import { configValidAtom } from '../ConfigurationForm';
import { Pause, PlayArrow } from '@mui/icons-material';
import { generateBussyAtom, generateTilingAtom } from '../GenerateButton';
import { useEffect } from 'react';
import { boxesAtom } from '../MainScene/Boxes';

export const generatingContinuouslyAtom = atom(false);

function RunPauseButton() {
  const configValid = useAtomValue(configValidAtom);
  const [generatingContinuosuly, setGeneratingContinuosuly] = useAtom(
    generatingContinuouslyAtom
  );
  const boxes = useAtomValue(boxesAtom);
  const generateTiling = useSetAtom(generateTilingAtom);

  const setChangesDisabled = useSetAtom(changesDisabledAtom);
  const setShowingProgress = useSetAtom(showProgressAtom);
  const generateBussy = useAtomValue(generateBussyAtom);

  // start/repeat generation loop
  useEffect(() => {
    if (generatingContinuosuly && !generateBussy) {
      setChangesDisabled(true);
      setShowingProgress(true);
      generateTiling(100);
    }
  }, [
    boxes, // triger on boxes change
    generatingContinuosuly,
    generateBussy,
    generateTiling,
    setChangesDisabled,
    setShowingProgress,
  ]);

  // clear changesDisabled/progress state when generation loop has stopped and no generation is in progress
  useEffect(() => {
    if (!generatingContinuosuly && !generateBussy) {
      setChangesDisabled(false);
      setShowingProgress(false);
    }
  }, [
    generateBussy,
    generatingContinuosuly,
    setChangesDisabled,
    setShowingProgress,
  ]);

  return (
    <Button
      variant={generatingContinuosuly ? 'contained' : 'outlined'}
      color={generatingContinuosuly ? 'error' : 'primary'}
      disabled={!configValid}
      onClick={() => {
        setGeneratingContinuosuly((running) => !running);
      }}
    >
      {generatingContinuosuly ? <Pause /> : <PlayArrow />}
    </Button>
  );
}

export default RunPauseButton;
