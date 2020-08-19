import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/FolderOpenOutlined';
import { BIBLES_ABBRV_INDEX } from '../../common/BooksOfTheBible';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '1000px',
    margin: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function BooksList({
  files,
  onItemClick,
}) {
  const classes = useStyles();
  const books = files.filter(({ path: bookId }) => Object.keys(BIBLES_ABBRV_INDEX).includes(bookId))

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="main mailbox folders">
      {
        books.map(({ path: bookId, url, sha: key }) => (
          <ListItem key={key} button onClick={() => onItemClick(bookId, url)}>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary={bookId} />
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
