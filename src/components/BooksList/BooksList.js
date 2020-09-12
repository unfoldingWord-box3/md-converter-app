import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/FolderOpenOutlined';
import { BIBLES_ABBRV_INDEX } from '../../common/BooksOfTheBible';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider'
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import useLoading from '../../hooks/useLoading';

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
  const classes = useStyles();
  const { state: { projects }, fetchTnMarkdown, setBookId } = React.useContext(TsvDataContext);
  const { isLoading, setIsLoading, setIsError } = useLoading();
  const books = files.filter(({ path: bookId }) => Object.keys(BIBLES_ABBRV_INDEX).includes(bookId))

  const loadProject = async (url, bookId) => {
    setIsLoading(true);
    await fetchTnMarkdown(url, bookId).catch(() => setIsError());
    setBookId(bookId);
    setIsLoading(false);
  }

  const onItemClick = (url, bookId) => {
    const found = projects.find(project => project.bookId === bookId);
    if (found) {
      if (window.confirm(`There's currently a ${bookId} project in your project list, Do you want to overwrite it?`)) {
        loadProject(url, bookId);
      }
    } else {
      loadProject(url, bookId);
    }
  }

  if (isLoading) {
    return <LoadingIndicator/>;
  } else {
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
}

BooksList.defaultProps = {
  files: []
}

BooksList.propTypes = {
  files: PropsTypes.array.isRequired,
};
