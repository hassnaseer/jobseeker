import { TextField, type TextFieldProps } from '@mui/material';

type Props = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string | number;
  onChange: (value: string) => void;
};

/** Reusable text-input field: consistent width/variant, and a plain-string onChange instead of an event. */
export default function FormTextField({ value, onChange, fullWidth = true, ...rest }: Props) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth={fullWidth}
      {...rest}
    />
  );
}
