import React, { useEffect } from 'react';
import PropsTypes from 'prop-types';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import exportToTSV from '../../helpers/exportToTSV';
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
  toggleRecordView,
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

  const { targetNotes, sourceNotes, bookId, languageId, resourceId } = project;
  const { language, subject, version } = sourceManifest?.dublin_core || {};
  let sourceNoteVersion = null;

  if (version) {
    sourceNoteVersion = `${language?.title} ${subject} - Version ${version}`
  }

  const sourceHeaders = Object.keys(sourceNotes[0] || {}).map(key => ({
    Header: key,
    accessor: key
  }))

  const sourceColumns = React.useMemo(
    () => sourceHeaders || [],
    [sourceHeaders]
  );

  const targetHeaders = Object.keys(targetNotes[0] || {}).map(key => ({
    Header: key,
    accessor: key
  }))

  const targetColumns = React.useMemo(
    () => {
      const shouldInclude = ['Reference', 'Included', 'Chapter', 'Verse', 'GLQuote', 'Quote', 'OccurrenceNote', 'Annotation', 'Question', 'Response' ]
      const targetColumns = targetHeaders.filter(({Header}) => shouldInclude.includes(Header))
      const foundIndex = targetColumns.findIndex(({Header}) => Header === 'Included')

      if (foundIndex) {// Move "Included" Header to the second in order
        const newHeader = targetColumns[foundIndex]
        targetColumns.splice(foundIndex, 1)// remove item
        targetColumns.splice(1, 0, newHeader)// add item
      }

      return targetColumns
    },
    [targetHeaders]
  );

  const exportProject = (targetRecords) => {
    exportToTSV(sourceNotes, targetRecords, bookId, resourceId);
  }

  const saveBackup = async () => {
    await downloadProjectBackup(project);
    setSavedBackup(true);
  }


  console.log({
    sourceNotes,
    targetNotes,
  })

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
            subject={subject}
            data={targetNotes}
            languageId={languageId}
            columns={targetColumns}
            saveBackup={saveBackup}
            savedBackup={savedBackup}
            exportProject={exportProject}
            setSavedBackup={setSavedBackup}
            toggleRecordView={toggleRecordView}
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
