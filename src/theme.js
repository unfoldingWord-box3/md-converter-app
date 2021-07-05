import { createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

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
    secondary: blue,
  },
  overrides: {
  },
});

export default theme;
