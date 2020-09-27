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
import getManifest from '../../helpers/getManifest';

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
  const {
    state: {
      glTsvs,
      projects,
    },
    isLoading,
    setIsLoading,
    loadingMessage,
    fetchTnMarkdown,
    fetchEnglishTsvs,
  } = React.useContext(TsvDataContext);
  const bookIds = Object.keys(BIBLES_ABBRV_INDEX);
  const { url: manifestUrl } = files.find(file => file.path === 'manifest.yaml');
  const books = files.filter(({ path: bookId }) => bookIds.includes(bookId)).sort((a, b) => bookIds.indexOf(a.path) - bookIds.indexOf(b.path));

  const onItemClick = async (url, bookId) => {
    const manifest = await getManifest(manifestUrl);
    const { dublin_core: { language } } = manifest;
    const projectName = `${language.identifier}_${bookId}`;
    const found = projects.find(project => project.name === projectName);
    const fetchSourceTsv = !glTsvs?.en && !glTsvs?.en?.manifest;

    if (found) {
      if (window.confirm(`There's currently a ${bookId} project in your project list, Do you want to overwrite it?`)) {
        setIsLoading(true);
        if (fetchSourceTsv) await fetchEnglishTsvs();
        await fetchTnMarkdown(url, bookId, manifest);
      }
    } else {
      if (fetchSourceTsv) await fetchEnglishTsvs();
      await fetchTnMarkdown(url, bookId, manifest);
    }
  }

  if (isLoading) {
    return <LoadingIndicator secondaryMessage={loadingMessage} />;
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
