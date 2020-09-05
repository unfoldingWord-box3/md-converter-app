import React from 'react';
import { useTable } from 'react-table';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { makeStyles } from '@material-ui/core/styles';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';

const useStyles = makeStyles(() => ({
  button: {
    margin: '25px',
  },
}));

const DraggableTable = ({
  data,
  columns,
  saveRecords,
}) => {
  const [records, setRecords] = React.useState(data);
  const classes = useStyles();

  const getRowId = React.useCallback((row) => {
    return row.id;
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    data: records,
    columns,
    getRowId
  });

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRecord = records[dragIndex];
    setRecords(
      update(records, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRecord]
        ]
      })
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '19px' }}/>
        <MaUTable {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell {...column.getHeaderProps()}>
                    {column.render('Header')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map(
              (row, index) =>
                prepareRow(row) || (
                  <Row
                    index={index}
                    row={row}
                    moveRow={moveRow}
                    {...row.getRowProps()}
                  />
                )
            )}
          </TableBody>
        </MaUTable>
        <Button className={classes.button} variant="contained" color="primary" onClick={() => saveRecords(records)}>
          Save
        </Button>
      </div>
    </DndProvider>
  );
};

const DND_ITEM_TYPE = 'row';

const Row = ({ row, index, moveRow }) => {
  const dropRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: DND_ITEM_TYPE, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0 : 1;
  const cursor = isDragging ? 'grabbing' : 'grab';

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <TableRow
      ref={dropRef}
      style={{ opacity }}
    >
      {row.cells.map((cell) => {
        return (
          <TableCell {...cell.getCellProps()}>
            {cell.render('Cell')}
          </TableCell>
        );
      })}
      <TableCell ref={dragRef} style={{ maxWidth: '50px', padding: '5px', cursor }}>
        <DragIndicatorIcon />
      </TableCell>
    </TableRow>
  );
};

export default DraggableTable;
