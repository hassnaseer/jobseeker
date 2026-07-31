import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  maxWidth?: number;
  dark?: boolean;
}

export default function AuthLayout({ children, maxWidth = 420, dark = false }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background: 'linear-gradient(180deg,#F6F6FB 0%,#EEEDF9 100%)',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth,
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          boxShadow: '0 8px 30px rgba(30,20,80,0.08)',
          ...(dark && {
            bgcolor: '#181722',
            color: '#fff',
            border: '1px solid #2C2A3D',
          }),
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            J
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            JobLinxs
          </Typography>
        </Stack>
        {children}
      </Paper>
    </Box>
  );
}
