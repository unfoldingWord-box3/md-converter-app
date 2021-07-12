import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropsTypes from 'prop-types';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import BackdropLoadingIndicator from '../BackdropLoadingIndicator';
import exportToTSV from '../../helpers/exportToTSV';
import downloadProjectBackup from '../../helpers/downloadProjectBackup';

export default function WorkingArea({
  project,
  savedBackup,
  sourceManifest,
  setSavedBackup,
  toggleRecordView,
}) {
  const [sourceData, setSourceData] = useState([])
  const [targetData, setTargetData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [precedingItemsCount, setPrecedingItemsCount] = useState(0)
  const fetchIdRef = useRef(0)

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

      if (foundIndex) {// Move "Included" Header to second in order
        if (targetColumns.includes('Reference')) {
          const newHeader = targetColumns[foundIndex]
          targetColumns.splice(foundIndex, 1)// remove item from current location
          targetColumns.splice(1, 0, newHeader)// add item to second in order.
        } else if (targetColumns.includes('Chapter') && targetColumns.includes('Verse')) {
          const newHeader = targetColumns[foundIndex]
          targetColumns.splice(foundIndex, 1)// remove item from current location.
          targetColumns.splice(2, 0, newHeader)// add item to third in order.
        }

      }

      return targetColumns
    },
    [targetHeaders]
  );

  const exportProject = () => {
    exportToTSV(sourceNotes, targetNotes, bookId, resourceId);
  }

  const saveBackup = async () => {
    await downloadProjectBackup(project);
    setSavedBackup(true);
  }

  // This will get called when the table needs new data
  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    // Give this fetch an ID
    const fetchId = ++fetchIdRef.current

    // Set the loading state
    setLoading(true)

    // Only update the data if this is the latest fetch
    if (fetchId === fetchIdRef.current) {
      const startRow = pageSize * pageIndex
      const endRow = startRow + pageSize
      setSourceData(sourceNotes.slice(startRow, endRow))
      setTargetData(targetNotes.slice(startRow, endRow))

      setPrecedingItemsCount(sourceNotes.slice(0, pageSize * pageIndex).length)
      // Set total page count.
      setPageCount(Math.ceil(sourceNotes.length / pageSize))

      setLoading(false)
    }
  }, [sourceNotes, targetNotes])

  if (targetNotes) {
    return (
      <>
        <BackdropLoadingIndicator loading={loading} />
        <Paper style={{ flex: 1 }}>
          <Styles>
            <Table
              data={sourceData}
              pageCount={pageCount}
              fetchData={fetchData}
              columns={sourceColumns}
              sourceNoteVersion={sourceNoteVersion}
            />
            <DraggableTable
              pageCount={pageCount}
              bookId={bookId}
              subject={subject}
              data={targetData}
              languageId={languageId}
              columns={targetColumns}
              saveBackup={saveBackup}
              savedBackup={savedBackup}
              exportProject={exportProject}
              setSavedBackup={setSavedBackup}
              toggleRecordView={toggleRecordView}
              targetNotes={targetNotes}
              precedingItemsCount={precedingItemsCount}
            />
          </Styles>
        </Paper>
      </>
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
