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
      contrastText: '#FFFFFF'
    },
  },
  overrides: {
  },
});

export default theme;
