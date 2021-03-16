import React, { useEffect } from 'react';
import PropsTypes from 'prop-types';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import exportNotes from '../../helpers/exportNotes';
import downloadProjectBackup from '../../helpers/downloadProjectBackup';

const Styles = styled.div`
  display: flex;
  padding: 1rem 1rem 0;

  table {
    th {
      font-weight: bold;
    }

    tr {
      height: 53px;
    }

    th,
    td {
      padding: 12px;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export default function WorkingArea({
  project,
  savedBackup,
  sourceManifest,
  setSavedBackup,
}) {
  useEffect(() => {
    const handleBeforeunload = (event) => {
      const returnValue = 'Changes you made may not be locally backed up. Do you wish to continue?';

      // Chrome requires `returnValue` to be set.
      if (event.defaultPrevented) {
        event.returnValue = '';
      }

      if (typeof returnValue === 'string') {
        event.returnValue = returnValue;
        return returnValue;
      }
    };

    if (!savedBackup) {
      window.addEventListener('beforeunload', handleBeforeunload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeunload);
    };
  }, [savedBackup]);

  const { targetNotes, sourceNotes, bookId, languageId } = project;
  const { language, subject, version } = sourceManifest?.dublin_core || {};
  let sourceNoteVersion = null;

  if (version) {
    sourceNoteVersion = `${language?.title} ${subject} - Version ${version}`
  }



  const headers = Object.keys(sourceNotes[0]).map(key => ({
    Header: key,
    accessor: key
  }))

  const sourceColumns = React.useMemo(
    () => headers,
    [headers]
  );

  const targetColumns = React.useMemo(
    () => [
      {
        Header: "Chapter",
        accessor: "Chapter"
      },
      {
        Header: "Verse",
        accessor: "Verse"
      },
      {
        Header: "GLQuote",
        accessor: "GLQuote"
      },
      {
        Header: "OccurrenceNote",
        accessor: "OccurrenceNote"
      }
    ],
    []
  );

  const exportProject = (targetRecords) => {
    exportNotes(sourceNotes, targetRecords, bookId, languageId);
  }

  const saveBackup = async () => {
    await downloadProjectBackup(project);
    setSavedBackup(true);
  }

  if (targetNotes) {
    return (
      <Paper style={{ flex: 1 }}>
        <Styles>
          <Table
            data={sourceNotes}
            columns={sourceColumns}
            sourceNoteVersion={sourceNoteVersion}
          />
          <DraggableTable
            bookId={bookId}
            data={targetNotes}
            languageId={languageId}
            columns={targetColumns}
            saveBackup={saveBackup}
            savedBackup={savedBackup}
            exportProject={exportProject}
            setSavedBackup={setSavedBackup}
          />
        </Styles>
      </Paper>
    );
  } else {
    return (
      <h1 style={{ display: 'flex', justifyContent: 'center' }}>
        Something went wrong ...
      </h1>
    );
  }
}

WorkingArea.propTypes = {
  project: PropsTypes.object.isRequired,
  sourceManifest: PropsTypes.object.isRequired,
};
