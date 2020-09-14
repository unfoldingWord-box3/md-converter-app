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
import NetlifyBadge from './components/NetlifyBadge';
import { TsvDataContext } from './state/contexts/TsvDataContextProvider'
import ScrollingWrapper from './components/ScrollingWrapper'
import MyProjects from './components/MyProjects'
import AppStepper from './components/AppStepper';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
  body: { margin: `${theme.spacing(1)}px` },
}));

export default function App() {
  const classes = useStyles();
  const [authentication, setAuthentication] = useState();
  const [repository, setRepository] = useState();
  const [showStepper, setShowStepper] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const { state: { currentProject, projects }, fetchEnglishTsvs, setProject, deleteProject, removeProject } = React.useContext(TsvDataContext);

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
      removeProject();
    } else {
      await myAuthStore.setItem('authentication', authentication)
      .then(function (authentication) {
        console.info("saveAuth() success. authentication is:", authentication);
      }).catch(function(err) {
          // This code runs if there were any errors
          console.info("saveAuth() failed. err:", err);
          console.info("saveAuth() failed. authentication:", authentication);
      });
    }
  };

  const toggleProjects = (value) => {
    setShowProjects(value);
    setShowStepper(!value);
  }

  console.log('authentication', authentication);

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
            <div>
              <AppBar toggleProjects={toggleProjects} />
              <div className={classes.body}>
                <ScrollingWrapper>
                  {
                    currentProject ?
                      <WorkingArea project={currentProject} />
                    :
                    (showProjects && authentication) || (!showStepper && projects && projects.length && authentication) ?
                      <MyProjects
                        projects={projects}
                        deleteProject={deleteProject}
                        toggleProjects={toggleProjects}
                        onProjectSelection={(project) => setProject(project)}
                      />
                    :
                      <AppStepper />
                  }
                </ScrollingWrapper>
              </div>
              <NetlifyBadge/>
            </div>
          </RepositoryContextProvider>
        </AuthenticationContextProvider>
      </MuiThemeProvider>
    </div>
  );
}
