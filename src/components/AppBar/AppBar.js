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
=import Folder from '@material-ui/icons/Folder';
import ListIcon from '@material-ui/icons/List';
import { appName } from '../../common/constants';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';

export default function AppBar({
  setshowStepper,
}) {
  const [filepath, setFilepath] = useState();
  const { removeProject } = useContext(TsvDataContext);

  const drawerMenu = (
    <List>
      <ListItem button key='My Projects' onClick={() => removeProject()}>
        <ListItemIcon style={{ margin: 0 }}>
          <ListIcon />
        </ListItemIcon>
        <ListItemText primary='My Projects' />
      </ListItem>
      <ListItem button key='New Project' onClick={() => setshowStepper()}>
        <ListItemIcon style={{ margin: 0 }}>
          <Folder />
        </ListItemIcon>
        <ListItemText primary='New Project' />
      </ListItem>
    </List>
  );

  return (
    <FileContextProvider
      filepath={filepath}
      onFilepath={setFilepath}
    >
      <ApplicationBar
        title={appName}
        drawerMenu={drawerMenu}
      />
    </FileContextProvider>
  );
};
