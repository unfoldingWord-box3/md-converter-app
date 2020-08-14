import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#59B7E7',
      main: '#2B374B',
      dark: '#014263',
      contrastText: '#FFF'
    },
  },
  overrides: {
  },
});

export default theme;
