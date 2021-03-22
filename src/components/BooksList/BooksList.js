import React, { useContext, useEffect, useState } from 'react';
import PropsTypes from 'prop-types';
import path from 'path';
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
  centered: {
    display: 'flex',
    width: '100%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));

export default function BooksList({
  files,
  resourceId,
}) {
  const classes = useStyles();
  const [manifest, setManifest] = useState({})
  const [manifestUrl, setManifestUrl] = useState(null)
  const [hasMarkdownContent, setHasMarkdownContent] = useState(false)
  const {
    state: {
      projects,
    },
    isLoading,
    setIsLoading,
    loadingMessage,
    fetchTnMarkdown,
  } = useContext(TsvDataContext);

  useEffect(() => {
    const { url: manifestUrl } = files.find(file => file.path === 'manifest.yaml') || {};

    setManifestUrl(manifestUrl)
  }, [files])

  useEffect(() => {
    async function fetchManifest() {
      setIsLoading(true);
      const emptyManifest = { dublin_core: {} }
      const manifest = manifestUrl ? await getManifest(manifestUrl) : emptyManifest;
      let { dublin_core: { format } } = manifest;

      if (!format) format = manifest.format

      setHasMarkdownContent(format?.includes('markdown') || false)
      setManifest(manifest || emptyManifest)
      setIsLoading(false);
    }

    fetchManifest()
  }, [manifestUrl, setIsLoading])
  const bookIds = Object.keys(BIBLES_ABBRV_INDEX);
  const books = files.filter(({ path: bookId }) => bookIds.includes(bookId) && !path.extname(bookId)).sort((a, b) => bookIds.indexOf(a.path) - bookIds.indexOf(b.path));

  console.log('BooksList files', {files})
  console.log('BooksList books', {books})

  async function onItemClick(url, bookId) {
    console.info('onItemClick')
    const { dublin_core: { language } } = manifest;
    const projectName = `${language?.identifier}_${bookId}${resourceId ? `_${resourceId}` : ''}`;
    const found = projects.find(project => project.name === projectName);

    if (found) {
      if (window.confirm(`There's currently a ${bookId} ${resourceId} project in your project list, Do you want to overwrite it?`)) {
        setIsLoading(true);
        await fetchTnMarkdown(url, bookId, manifest, resourceId);
      }
    } else {
      setIsLoading(true);
      await fetchTnMarkdown(url, bookId, manifest, resourceId);
    }
  }

  if (isLoading) {
    return <LoadingIndicator secondaryMessage={loadingMessage} />;
  } else if (!hasMarkdownContent || books.length === 0 || !books) {// TODO: Test !hasMarkdownContent
    return (
      <h2 className={classes.centered}>
        This repo may not have the necessary contents to convert from markdown to TSV
      </h2>
    )
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
  files: PropsTypes.array,
};
