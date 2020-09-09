import React from 'react';
import PropsTypes from 'prop-types';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import exportNotes from '../../helpers/exportNotes';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';

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
}) {
  const { saveProjectChanges } = React.useContext(TsvDataContext);
  const { targetNotes, sourceNotes, bookId } = project;

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
    exportNotes(sourceNotes, targetRecords, bookId);
  }

  if (targetNotes) {
    return (
      <Paper>
        <Styles>
          <Table
            columns={sourceColumns}
            data={sourceNotes}
          />
          <DraggableTable
            columns={targetColumns}
            data={targetNotes}
            exportProject={exportProject}
            saveChanges={saveProjectChanges}
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
};
