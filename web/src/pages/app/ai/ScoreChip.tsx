import { Chip } from '@mui/material';

/** Colored score chip shared across the AI Recruiter views — green for a strong fit, amber for partial, gray for weak. */
export default function ScoreChip({ score }: { score: number }) {
  const color = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'default';
  return <Chip label={`${score}`} color={color} size="small" sx={{ fontWeight: 700 }} />;
}
