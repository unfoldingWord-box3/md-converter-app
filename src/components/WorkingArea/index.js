import React from 'react';
import styled from 'styled-components';
import Table from '../Table';
import DraggableTable from '../DraggableTable';
import AppStepper from '../AppStepper';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider'
import { ProjectContext } from '../../state/contexts/ProjectContextProvider'

const Styles = styled.div`
  display: flex;
  padding: 1rem;

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

  console.log('====================================');
  console.log('bookId', bookId);
  console.log('sourceNotes', sourceNotes);
  console.log('targetNotes', targetNotes);
  console.log('====================================');

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

  if (targetNotes[bookId]) {
    return (
      <Styles>
        <Table columns={sourceColumns} data={sourceNotes[bookId]} />
        <DraggableTable columns={targetColumns} data={targetNotes[bookId]} />
      </Styles>
    );
  } else {
    return <AppStepper />
  }
}
