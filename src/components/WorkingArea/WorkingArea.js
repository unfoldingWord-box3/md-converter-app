import React from 'react';
import PropsTypes from 'prop-types';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import exportNotes from '../../helpers/exportNotes';

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
  sourceManifest,
}) {
  const { targetNotes, sourceNotes, bookId, languageId } = project;
  const { language, subject, version } = sourceManifest?.dublin_core || {};
  let sourceNoteVersion = null;

  if (version) {
    sourceNoteVersion = `${language?.title} ${subject} - Version ${version}`
  }

  const sourceColumns = React.useMemo(
    () => [
      {
        Header: "Book",
        accessor: "Book"
      },
      {
        Header: "Chapter",
        accessor: "Chapter"
      },
      {
        Header: "Verse",
        accessor: "Verse"
      },
      {
        Header: "ID",
        accessor: "ID"
      },
      {
        Header: "SupportReference",
        accessor: "SupportReference"
      },
      {
        Header: "OrigQuote",
        accessor: "OrigQuote"
      },
      {
        Header: "Occurrence",
        accessor: "Occurrence"
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
            exportProject={exportProject}
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
