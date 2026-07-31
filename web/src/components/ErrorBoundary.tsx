import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReload = (): void => {
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.error) {
      return (
        <Container maxWidth="sm">
          <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Something went wrong
              </Typography>
              <Typography color="text.secondary">
                An unexpected error occurred while rendering this page. You can try reloading, and if
                the problem continues, let us know.
              </Typography>
              {import.meta.env.DEV && (
                <Typography
                  component="pre"
                  variant="caption"
                  sx={{
                    textAlign: 'left',
                    bgcolor: 'grey.100',
                    p: 2,
                    borderRadius: 2,
                    maxWidth: '100%',
                    overflow: 'auto',
                  }}
                >
                  {this.state.error.message}
                </Typography>
              )}
              <Button variant="contained" onClick={this.handleReload}>
                Reload JobLinxs
              </Button>
            </Stack>
          </Box>
        </Container>
      );
    }
    return this.props.children;
  }
}
