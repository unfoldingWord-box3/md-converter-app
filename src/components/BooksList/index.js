import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/FolderOpenOutlined';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function BooksList({
  files,
  onItemClick,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="main mailbox folders">
      {
        files.map(({ path: book, url, sha: key }) => (
          <ListItem key={key} button onClick={() => onItemClick(book, url)}>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary={book} />
          </ListItem>
        ))
      }
      </List>
    </div>
  );
}

BooksList.propTypes = {
  files: PropsTypes.array.isRequired,
  onItemClick: PropsTypes.func.isRequired,
};
