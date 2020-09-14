import React, { useEffect } from 'react';
import { useTable } from 'react-table';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  fill: {
    height: '19px',
  },
  buttons: {
    display: 'flex',
  },
  button: {
    width: '100%',
    margin: '20px',
  },
}));

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 200,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const DraggableTable = ({
  data,
  columns,
  exportProject,
}) => {
  const classes = useStyles();
  const [records, setRecords] = React.useState(data);
  const { saveProjectChanges } = React.useContext(TsvDataContext);

  useEffect(() => {
    saveProjectChanges(records);
    // eslint-disable-next-line
  }, [records])

  const getRowId = React.useCallback((row, relativeIndex) => {
    return relativeIndex + row.id
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    data: records,
    columns,
    getRowId,
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
      <div className={classes.root}>
        <div className={classes.fill}/>
        <MaUTable {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  const tCellStyle = {};
                  if (column.Header === "GLQuote") tCellStyle.minWidth = '160px';

                  return (
                    <TableCell {...column.getHeaderProps()} style={tCellStyle}>
                      {column.render('Header')}
                    </TableCell>
                  )
                })}
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
        <div className={classes.buttons}>
          <Button className={classes.button} variant="contained" color="primary" onClick={() => exportProject(records)}>
            Export to TSV
          </Button>
        </div>
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
      {row.cells.map((cell, key) => <Record key={key} cell={cell} />)}
      <TableCell ref={dragRef} style={{ maxWidth: '50px', padding: '5px', cursor }} title="Drag">
        <DragIndicatorIcon />
      </TableCell>
    </TableRow>
  );
};

const Record = ({
  cell,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <HtmlTooltip
        arrow
        open={open}
        disableHoverListener
        title={cell.value}
        onClose={handleTooltipClose}
      >
        <TableCell
          {...cell.getCellProps()}
          onClick={handleTooltipOpen}
          style={{ borderLeft: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {cell.render('Cell')}
        </TableCell>
      </HtmlTooltip>
    </ClickAwayListener>
  );
}

export default DraggableTable;
