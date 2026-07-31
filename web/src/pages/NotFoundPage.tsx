import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h1" color="primary" sx={{ fontWeight: 900, fontSize: 96 }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Page not found
          </Typography>
          <Typography color="text.secondary">
            The page you're looking for doesn't exist or may have been moved.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Back to JobLinxs
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
