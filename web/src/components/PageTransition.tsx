import { useLocation, useOutlet } from 'react-router-dom';
import { Fade } from '@mui/material';

/** Fades route content in/out on navigation. Wrap an <Outlet />'s host with this. */
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <Fade key={location.pathname} in timeout={220}>
      <div>{outlet}</div>
    </Fade>
  );
}
