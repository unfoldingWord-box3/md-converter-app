import React, { useState, useContext } from "react";
import { Paper } from "@material-ui/core";
import {
  AuthenticationContext,
  AuthenticationContextProvider,
  RepositoryContext,
  RepositoryContextProvider,
} from "gitea-react-toolkit";

const content = "IyBFbm9zaCAuLi4gS2VuYW4gLi4uIE1haGFsYWxlbCAuLi4gSmFyZWQgLi4uIEVub2NoIC4uLiBNZXRodXNlbGFoIC4uLiBMYW1lY2gKClRoZXNlIGFyZSBhbGwgbmFtZXMgb2YgbWVuLiBFYWNoIG1hbiB3YXMgdGhlIGZhdGhlciBvciBhbmNlc3RvciBvZiB0aGUgbmV4dCBtYW4gaW4gdGhlIGxpc3QuIElmIHlvdXIgbGFuZ3VhZ2UgaGFzIGEgc3BlY2lmaWMgd2F5IHRvIG1hcmsgdGhpcyBraW5kIG9mIGxpc3QsIHlvdSBjYW4gdXNlIGl0IGhlcmUuIChTZWU6IFtbcmM6Ly9lbi90YS9tYW4vdHJhbnNsYXRlL3RyYW5zbGF0ZS1uYW1lc11dKQoKIyBMYW1lY2guIFRoZSBzb25zIG9mIE5vYWgKCklmIHlvdXIgcmVhZGVycyB3aWxsIG5lZWQgdG8gc2VlIHRoYXQgTm9haCB3YXMgdGhlIHNvbiBvZiBMYW1lY2ggYW5kIHlvdXIgbGFuZ3VhZ2UgaGFzIGEgd2F5IHRvIG1hcmsgaXQsIHlvdSBzaG91bGQgdXNlIGl0IGhlcmUuIAoKIyBUaGUgc29ucyBvZiBOb2FoIHdlcmUgU2hlbSwgSGFtLCBhbmQgSmFwaGV0aAoKU29tZSB2ZXJzaW9ucywgaW5jbHVkaW5nIHRoZSBVTEIgYW5kIFVEQiwgaW5jbHVkZSAiVGhlIHNvbnMgb2YiIGluIG9yZGVyIHRvIG1ha2UgaXQgY2xlYXIgdGhhdCBTaGVtLCBIYW0sIGFuZCBKYXBoZXRoIHdlcmUgYnJvdGhlcnMgdG8gZWFjaCBvdGhlciBhbmQgc29ucyBvZiBOb2FoLiBPdGhlcndpc2UsIHRoZSByZWFkZXIgd291bGQgYXNzdW1lIHRoYXQgZWFjaCBwZXJzb24gcmVwcmVzZW50ZWQgb25lIGdlbmVyYXRpb24gZmFydGhlciBhd2F5IGZyb20gTm9haCwgdGhlaXIgYW5jZXN0b3IuCgojIHRyYW5zbGF0aW9uV29yZHMKCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvYWRhbV1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvc2V0aF1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvZW5vY2hdXQoqIFtbcmM6Ly9lbi90dy9kaWN0L2JpYmxlL25hbWVzL2xhbWVjaF1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvbm9haF1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvc2hlbV1dCiogW1tyYzovL2VuL3R3L2RpY3QvYmlibGUvbmFtZXMvaGFtXV0KKiBbW3JjOi8vZW4vdHcvZGljdC9iaWJsZS9uYW1lcy9qYXBoZXRoXV0K";

function Component() {
  const { state: auth, component: authComponent } = useContext(
    AuthenticationContext
  );
  const { state: repo, component: repoComponent } = useContext(
    RepositoryContext
  );

  console.log("repo", repo);
  console.log("content", atob(content));

  return (
    (!auth && authComponent) || (!repo && repoComponent)
  );
}

export default function App() {
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <Paper>
        <AuthenticationContextProvider
          config={{
            server: "https://git.door43.org",
            tokenid: "PlaygroundTesting"
          }}
          authentication={authentication}
          onAuthentication={setAuthentication}
        >
          <RepositoryContextProvider
            repository={repository}
            onRepository={setRepository}
            defaultOwner={authentication && authentication.user.name}
            defaultQuery=""
            // branch='master'
          >
            <Component />
          </RepositoryContextProvider>
        </AuthenticationContextProvider>
      </Paper>
    </div>
  );
}
