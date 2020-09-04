import React from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import AppStepper from '../AppStepper';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider'
import { ProjectContext } from '../../state/contexts/ProjectContextProvider'
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
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export default function WorkingArea() {
  const { state: { targetNotes, sourceNotes } } = React.useContext(TsvDataContext);
  const { state: { bookId } } = React.useContext(ProjectContext);

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

  const saveRecords = (targetRecords) => {
    exportNotes(sourceNotes[bookId], targetRecords, bookId);
  }

  if (targetNotes[bookId]) {
    return (
      <Paper>
        <Styles>
          <Table columns={sourceColumns} data={sourceNotes[bookId]} />
          <DraggableTable columns={targetColumns} data={targetNotes[bookId]} saveRecords={saveRecords} />
        </Styles>
      </Paper>
    );
  } else {
    return <AppStepper />
  }
}
