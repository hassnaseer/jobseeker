import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg,#F6F6FB 0%,#EEEDF9 100%)',
        p: 3,
      }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 560 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: 24,
          }}
        >
          J
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          JobLinxs
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Post jobs, hire talent, and get paid — all in one place.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button component={RouterLink} to="/signup" variant="contained" size="large">
            Get started
          </Button>
          <Button component={RouterLink} to="/login" variant="outlined" size="large">
            Sign in
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
