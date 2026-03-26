import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  AppBar,
  Container,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';
import theme from '../utils/theme';
import { APP_NAME } from '../utils/constants';

export default function MuLayout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ bgcolor: '#fff', color: '#000', boxShadow: 'none', borderBottom: '1px solid #eee' }}
      >
        <Container maxWidth="sm">
          <Toolbar disableGutters>
            <Link to="./" style={{ textDecoration: 'none', flexGrow: 1 }}>
              <Typography
                className="underline decoration-4 decoration-yellow-300"
                variant="h4"
                fontWeight="bold"
                color="#000"
              >
                {APP_NAME}.
              </Typography>
            </Link>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="sm" className="pt-20 min-h-screen">
        <Outlet />
      </Container>
    </ThemeProvider>
  );
}
