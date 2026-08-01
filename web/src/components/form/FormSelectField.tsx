import { MenuItem, TextField, type TextFieldProps } from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'select'> & {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  allowEmpty?: boolean;
  emptyLabel?: string;
};

/** Reusable select field: takes a plain options array and a plain-string onChange. */
export default function FormSelectField({
  value,
  onChange,
  options,
  allowEmpty = true,
  emptyLabel = '—',
  fullWidth = true,
  ...rest
}: Props) {
  return (
    <TextField select value={value} onChange={(e) => onChange(e.target.value)} fullWidth={fullWidth} {...rest}>
      {allowEmpty && <MenuItem value="">{emptyLabel}</MenuItem>}
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
