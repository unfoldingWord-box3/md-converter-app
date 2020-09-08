import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#014263',
      main: '#2B374B',
      dark: '#000000',
      contrastText: '#FFFFFF',
      grey: 'rgba(0, 0, 0, 0.04)',
    },
  },
  overrides: {
  },
});

export default theme;
