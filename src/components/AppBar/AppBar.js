import React, { useState, useContext } from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  ApplicationBar,
  FileContextProvider,
} from 'gitea-react-toolkit';
import Folder from '@material-ui/icons/Folder';
import ListIcon from '@material-ui/icons/List';
import { appName } from '../../common/constants';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';

export default function AppBar({
  savedBackup,
  currentProject,
  toggleProjects,
}) {
  const [filepath, setFilepath] = useState();
  const { removeProject } = useContext(TsvDataContext);
  const noPrompt = !currentProject ? true : savedBackup;
  const promptText = 'Changes you made may not be locally backed up. Do you wish to continue?';

  const onProjectPage = () => {
    if (noPrompt) {
      removeProject();
      toggleProjects(true);
    } else {
      if (window.confirm(promptText)) {
        removeProject();
        toggleProjects(true);
      }
    }
  }

  const onNewProject = () => {
    if (noPrompt) {
      toggleProjects(false);
      removeProject();
    } else {
      if (window.confirm(promptText)) {
        toggleProjects(false);
        removeProject();
      }
    }
  }

  const drawerMenu = (
    <List>
      <ListItem
        button
        key='My Projects'
        onClick={onProjectPage}
      >
        <ListItemIcon style={{ margin: 0 }}>
          <ListIcon />
        </ListItemIcon>
        <ListItemText primary='My Projects' />
      </ListItem>
      <ListItem
        button
        key='New Project'
        onClick={onNewProject}
      >
        <ListItemIcon style={{ margin: 0 }}>
          <Folder />
        </ListItemIcon>
        <ListItemText primary='New Project' />
      </ListItem>
    </List>
  );

  const title = (
    <div style={{ cursor: 'pointer' }} onClick={onProjectPage}>{appName}</div>
  );

  return (
    <FileContextProvider
      filepath={filepath}
      onFilepath={setFilepath}
    >
      <ApplicationBar
        title={title}
        drawerMenu={drawerMenu}
        drawerMenuProps={{
          hideRepoContents: true,
          closeOnListItemsClick: true,
        }}
      />
    </FileContextProvider>
  );
};
