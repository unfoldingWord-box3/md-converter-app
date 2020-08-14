import React, { useState, useContext, Fragment } from "react";
import localforage from 'localforage';
import {
  RepositoryContext,
  AuthenticationContext,
  RepositoryContextProvider,
  AuthenticationContextProvider,
} from "gitea-react-toolkit";
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import './App.css'
import {
  tokenid,
  base_url,
} from './common/constants';
import AppBar from './components/AppBar';
import BooksList from './components/BooksList';
import LoadingIndicator from './components/LoadingIndicator';
import useFetch from './hooks/useFetch';

// const content = "IyBFbm9zaCAuLi4gS2VuYW4gLi4uIE1haGFsYWxlbCAuLi4gSmFyZWQgLi4uIEVub2NoIC4uLiBNZXRodXNlbGFoIC4uLiBMYW1lY2gKClRoZXNlIGFyZSBhbGwgbmFtZXMgb2YgbWVuLiBFYWNoIG1hbiB3YXMgdGhlIGZhdGhlciBvciBhbmNlc3RvciBvZiB0aGUgbmV4dCBtYW4gaW4gdGhlIGxpc3QuIElmIHlvdXIgbGFuZ3VhZ2UgaGFzIGEgc3BlY2lmaWMgd2F5IHRvIG1hcmsgdGhpcyBraW5kIG9mIGxpc3QsIHlvdSBjYW4gdXNlIGl0IGhlcmUuIChTZWU6IFtbcmM6Ly9lbi90YS9tYW4vdHJhbnNsYXRlL3RyYW5zbGF0ZS1uYW1lc11dKQoKIyBMYW1lY2guIFRoZSBzb25zIG9mIE5vYWgKCklmIHlvdXIgcmVhZGVycyB3aWxsIG5lZWQgdG8gc2VlIHRoYXQgTm9haCB3YXMgdGhlIHNvbiBvZiBMYW1lY2ggYW5kIHlvdXIgbGFuZ3VhZ2UgaGFzIGEgd2F5IHRvIG1hcmsgaXQsIHlvdSBzaG91bGQgdXNlIGl0IGhlcmUuIAoKIyBUaGUgc29ucyBvZiBOb2FoIHdlcmUgU2hlbSwgSGFtLCBhbmQgSmFwaGV0aAoKU29tZSB2ZXJzaW9ucywgaW5jbHVkaW5nIHRoZSBVTEIgYW5kIFVEQiwgaW5jbHVkZSAiVGhlIHNvbnMgb2YiIGluIG9yZGVyIHRvIG1ha2UgaXQgY2xlYXIgdGhhdCBTaGVtLCBIYW0sIGFuZCBKYXBoZXRoIHdlcmUgYnJvdGhlcnMgdG8gZWFjaCBvdGhlciBhbmQgc29ucyBvZiBOb2FoLiBPdGhlcndpc2UsIHRoZSByZWFkZXIgd291bGQgYXNzdW1lIHRoYXQgZWFjaCBwZXJzb24gcmVwcmVzZW50ZWQgb25lIGdlbmVyYXRpb24gZmFydGhlciBhd2F5IGZyb20gTm9haCwgdGhlaXIgYW5jZXN0b3IuCgojIHRyYW5zbGF0aW9uV29yZHMKCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvYWRhbV1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvc2V0aF1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvZW5vY2hdXQoqIFtbcmM6Ly9lbi90dy9kaWN0L2JpYmxlL25hbWVzL2xhbWVjaF1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvbm9haF1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvc2hlbV1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvaGFtXV0KKiBbW3JjOi8vZW4vdHcvZGljdC9iaWJsZS9uYW1lcy9qYXBoZXRoXV0K";
// console.log("content", atob(content));

function Component() {
  const { state: auth, component: authComponent } = useContext(AuthenticationContext);
  const { state: repo, component: repoComponent } = useContext(RepositoryContext);
  const { tree_url } = repo || {};
  const { data, isLoading, isError } = useFetch(tree_url);

  console.log("repo", repo);
  console.log("data", data);

  let Comp = (!auth && <div style={{ width: '800px' }}>{authComponent}</div>) || (!repo && <div style={{ width: '100%' }}>{repoComponent}</div>);

  if (data) {
    Comp = (
      <BooksList files={data.tree} onItemClick={(book, url) => console.log(book, url)}/>
    )
  }

  return (
    <Fragment>
      {isError && <h1>Something went wrong ...</h1>}
      {isLoading ? (
          <LoadingIndicator/>
      ) : (Comp)
      }
    </Fragment>
  );
}

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
              <Component />
            </div>
          </RepositoryContextProvider>
        </AuthenticationContextProvider>
      </MuiThemeProvider>
    </div>
  );
}
