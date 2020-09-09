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
import Mail from '@material-ui/icons/Mail';
import Inbox from '@material-ui/icons/Inbox';
import ListIcon from '@material-ui/icons/List';
import { appName } from '../../common/constants';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';

export default function AppBar() {
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
      <ListItem button key='Inbox'>
        <ListItemIcon style={{ margin: 0 }}>
          <Inbox />
        </ListItemIcon>
        <ListItemText primary={'Inbox'} />
      </ListItem>
      <ListItem button key='Mail'>
        <ListItemIcon style={{ margin: 0 }}>
          <Mail />
        </ListItemIcon>
        <ListItemText primary={'Mail'} />
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
