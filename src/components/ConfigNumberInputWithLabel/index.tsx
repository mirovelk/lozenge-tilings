import { css, Input, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import { configValidated } from '../../redux/features/config/configSlice';
import { useAppDispatch } from '../../redux/store';

interface Props {
  label: string;
  initialValue: number;
  inputValueValid: (value: string) => boolean;
  onValidChange: (value: number) => void;
}

function ConfigNumberInputWithLabel({
  label,
  initialValue,
  inputValueValid,
  onValidChange,
}: Props) {
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = useState<string>(initialValue.toString());

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (inputValueValid(e.target.value)) {
        dispatch(configValidated({ valid: true }));
        onValidChange(Number(e.target.value));
      } else {
        dispatch(configValidated({ valid: false }));
      }
    },
    [inputValueValid, dispatch, onValidChange]
  );

  return (
    <div
      css={css`
        display: flex;
        align-items: baseline;
        margin-right: 20px;
      `}
    >
      <Typography
        variant="subtitle1"
        color="text.secondary"
        css={css`
          margin-right: 10px;
        `}
      >
        {label}
      </Typography>
      <Input
        value={inputValue}
        type="number"
        error={!inputValueValid(inputValue)}
        onChange={onInputChange}
        css={css`
          margin-right: 10px;
        `}
      />
    </div>
  );
}

export default ConfigNumberInputWithLabel;
