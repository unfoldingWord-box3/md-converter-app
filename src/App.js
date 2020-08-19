import React, { useState } from "react";
import localforage from 'localforage';
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
import AppStepper from './components/AppStepper';

export default function App() {
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();
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
    <div className="App">
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
            <div style={{ display: "flex", justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <AppStepper authentication={authentication} repository={repository}/>
            </div>
          </RepositoryContextProvider>
        </AuthenticationContextProvider>
      </MuiThemeProvider>
    </div>
  );
}
