import React, { useState, useContext, useEffect } from "react";
import localforage from 'localforage';
import * as cacheLibrary from 'money-clip';
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
  const [authentication, setAuthentication] = useState(null);
  const [repository, setRepository] = useState(null);
  const [showStepper, setShowStepper] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const {
    setProject,
    savedBackup,
    deleteProject,
    removeProject,
    setSavedBackup,
    toggleRecordView,
    projects,
    currentProject,
  } = useContext(TsvDataContext);

  useEffect(() => {
    // Delete previous cache implementation.
    cacheLibrary.del('tsvDataReducer')
  }, [])

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
      setRepository(null);
    } else {
      await myAuthStore.setItem('authentication', authentication)
      .then(function (authentication) {
        console.info("saveAuth() success. authentication user is:", authentication.user.login);
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
            onRepository={(repo) => {
              toggleProjects(false);
              removeProject();
              setRepository(repo);
            }}
            defaultOwner={authentication && authentication.user.name}
            defaultQuery=""
          >
            <div>
              <AppBar toggleProjects={toggleProjects} savedBackup={savedBackup} currentProject={currentProject}/>
              <div className={classes.body}>
                <ScrollingWrapper>
                  {
                    currentProject && authentication ?
                      <WorkingArea
                        project={currentProject}
                        savedBackup={savedBackup}
                        setSavedBackup={setSavedBackup}
                        toggleRecordView={toggleRecordView}
                        sourceManifest={currentProject?.sourceManifest || {}}
                      />
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
