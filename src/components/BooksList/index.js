import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/FolderOpenOutlined';
import { BIBLES_ABBRV_INDEX } from '../../common/BooksOfTheBible';
import fetchTnMarkdownAction from "../../state/actions/fetchTnMarkdownAction";
import { TnDataContext } from '../../state/contexts/TnDataContextProvider'
import { ProjectContext } from '../../state/contexts/ProjectContextProvider'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function BooksList({
  files,
}) {
  const { dispatch } = React.useContext(TnDataContext);
  const { setBookId } = React.useContext(ProjectContext);
  const classes = useStyles();
  const books = files.filter(({ path: bookId }) => Object.keys(BIBLES_ABBRV_INDEX).includes(bookId))

  const onItemClick = async (url, bookId) => {
    await fetchTnMarkdownAction(dispatch, url, bookId)
    setBookId(bookId);
  }

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="main mailbox folders">
      {
        books.map(({ path: bookId, url, sha: key }) => (
          <ListItem key={key} button onClick={() => onItemClick(url, bookId)}>
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

BooksList.defaultProps = {
  files: []
}

BooksList.propTypes = {
  files: PropsTypes.array.isRequired,
};
