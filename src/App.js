import React, { useState, useEffect } from "react";
import localforage from 'localforage';
import { makeStyles } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
  RepositoryContextProvider,
  AuthenticationContextProvider,
} from "gitea-react-toolkit";
import theme from './theme';
import {
  tokenid,
  base_url,
} from './common/constants';
import AppBar from './components/AppBar';
import WorkingArea from './components/WorkingArea';
import { TsvDataContext } from './state/contexts/TsvDataContextProvider'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
  body: { margin: `${theme.spacing(2)}px` },
}));

export default function App() {
  const classes = useStyles();
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();
  const { fetchEnglishTsvs } = React.useContext(TsvDataContext);

  useEffect(() => {
    async function fetchData() {
      return fetchEnglishTsvs()
    }

    fetchData();
    // eslint-disable-next-line
  }, []);

  const myAuthStore = localforage.createInstance({
    driver: [localforage.INDEXEDDB],
    name: 'my-auth-store',
  });

  const getAuth = async () => {
    const auth = await myAuthStore.getItem('authentication');
    return auth;
  };

  const saveAuth = async (authentication) => {
    if (authentication === undefined || authentication === null) {
      await myAuthStore.removeItem('authentication');
    } else {
      await myAuthStore.setItem('authentication', authentication)
      .then(function (authentication) {
        console.log("saveAuth() success. authentication is:", authentication);
      }).catch(function(err) {
          // This code runs if there were any errors
          console.log("saveAuth() failed. err:", err);
          console.log("saveAuth() failed. authentication:", authentication);
      });
    }
  };

  return (
    <div className={classes.root}>
      <MuiThemeProvider theme={theme}>
        <AuthenticationContextProvider
          config={{
            server: base_url,
            tokenid,
          }}
          authentication={authentication}
          onAuthentication={setAuthentication}
          loadAuthentication={getAuth}
          saveAuthentication={saveAuth}
        >
          <RepositoryContextProvider
            repository={repository}
            onRepository={setRepository}
            defaultOwner={authentication && authentication.user.name}
            defaultQuery=""
            // branch='master'
          >
            <AppBar/>
            <div className={classes.body}>
              <WorkingArea />
            </div>
          </RepositoryContextProvider>
        </AuthenticationContextProvider>
      </MuiThemeProvider>
    </div>
  );
}
