import { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { TextField, type TextFieldProps } from '@mui/material';
import 'react-phone-number-input/style.css';

const MuiPhoneInput = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => (
  <TextField {...props} inputRef={ref} fullWidth />
));
MuiPhoneInput.displayName = 'MuiPhoneInput';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helperText?: string;
}

/** Reusable phone number field with international formatting/validation via react-phone-number-input. */
export default function PhoneField({ label, value, onChange, required, helperText }: Props) {
  return (
    <PhoneInput
      international
      defaultCountry="US"
      flags={flags}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      inputComponent={MuiPhoneInput}
      label={label}
      required={required}
      helperText={helperText}
    />
  );
}
