import { useState, type KeyboardEvent } from 'react';
import { Box, Chip, Stack, TextField } from '@mui/material';

interface Props {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
}

export default function ChipListInput({ label, value, onChange, helperText }: Props) {
  const [draft, setDraft] = useState('');

  const addDraft = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addDraft();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Box>
      <TextField
        label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addDraft}
        helperText={helperText ?? 'Press Enter to add'}
        fullWidth
      />
      {value.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {value.map((item) => (
            <Chip key={item} label={item} onDelete={() => onChange(value.filter((v) => v !== item))} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
