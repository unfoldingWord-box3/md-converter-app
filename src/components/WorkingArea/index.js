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

    th,
    td {
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export default function WorkingArea() {
  const { state: { targetNotes, sourceNotes, glTsvs } } = React.useContext(TsvDataContext);
  const { state: { bookId } } = React.useContext(ProjectContext);

  console.log('====================================');
  console.log('glTsvs', glTsvs);
  console.log('targetNotes', targetNotes);
  console.log('bookId', bookId);
  console.log('====================================');

  const enColumns = React.useMemo(
    () => [
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

  const glColumns = React.useMemo(
    () => [
      // {
      //   Header: "Book",
      //   accessor: "Book"
      // },
      // {
      //   Header: "Chapter",
      //   accessor: "Chapter"
      // },
      // {
      //   Header: "Verse",
      //   accessor: "Verse"
      // },
      // {
      //   Header: "ID",
      //   accessor: "id"
      // },
      // {
      //   Header: "SupportReference",
      //   accessor: "SupportReference"
      // },
      // {
      //   Header: "OrigQuote",
      //   accessor: "OrigQuote"
      // },
      // {
      //   Header: "Occurrence",
      //   accessor: "Occurrence"
      // },
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
        <Table columns={enColumns} data={sourceNotes[bookId]} />
        <DraggableTable columns={glColumns} data={targetNotes[bookId]} />
      </Styles>
    );
  } else {
    return <AppStepper />
  }
}
