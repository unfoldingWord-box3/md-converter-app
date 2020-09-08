import React, { useState } from 'react';
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
import { Mail, Inbox } from '@material-ui/icons';
import { appName } from '../../common/constants'

export default function AppBar() {
  const [filepath, setFilepath] = useState();

  const drawerMenu = (
    <List>
      {['Inbox', 'Sent'].map((text, index) => (
        <ListItem button key={text}>
          <ListItemIcon style={{margin:0}}>
            {index % 2 === 0 ? <Inbox /> : <Mail />}
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}
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
