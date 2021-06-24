import React from 'react'
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';

export default function Pagination ({
  controlledPageCount,
  canPreviousPage,
  previousPage,
  setPageSize,
  canNextPage,
  pageOptions,
  pageIndex,
  pageSize,
  pageCount,
  gotoPage,
  nextPage,
  page,
}) {
  const classes = useStyles();

  return (
    <Container>
      <GridRow>
        <span>
          Showing {page.length} of {controlledPageCount * pageSize}{' '}rows
        </span>
        <Button variant="contained" color="secondary" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </Button>
        <Button variant="contained" color="secondary" onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </Button>
        <Button variant="contained" color="secondary" onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </Button>
        <Button variant="contained" color="secondary" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </Button>
        <FormControl color='secondary'>
          <InputLabel
            id="select-label"
            classes={{ root: classes.inputLabelRoot }}
          >
            Show
          </InputLabel>
          <Select
            label="Rows"
            id="select-outlined"
            labelId="select-outlined-label"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
            }}
            classes={{
              root: classes.selectRoot,
              icon: classes.selectIcon,
            }}
          >
            {[10, 20, 30, 40, 50, 100].map(pageSize => (
              <MenuItem key={pageSize} value={pageSize}>
                {pageSize} rows
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl color='secondary'>
          <InputLabel
            id="select-label"
            classes={{ root: classes.inputLabelRoot }}
          >
            Go to page:
          </InputLabel>
          <Input
            color='secondary'
            type='number'
            value={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              gotoPage(page)
            }}
            classes={{ root: classes.inputLabelRoot }}
          />
        </FormControl>
        <PageInfo>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions?.length}
          </strong>{' '}
        </PageInfo>
      </GridRow>
    </Container>
  )
}

const useStyles = makeStyles(() => ({
  selectRoot: {
    color: '#FFFFFF',
    width: '90px',
  },
  selectIcon: {
    color: '#FFFFFF'
  },
  inputLabelRoot: {
    color: '#FFFFFF',
    width: '90px',
  },
  notchedOutline: {
    borderColor: '#FFFFFF'
  },
}));

const Container = styled.div`
  font-size: 18px;
  color: #fff;
  background-color: #2B374B;
  padding: 1rem 2rem;
  border-top-left-radius: 1rem;
  position: fixed;
  bottom: 0px;
  right: 0%;
  z-index: 2;
`

const GridRow = styled.div`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  grid-gap: 1rem;
`

const PageInfo = styled.span`
  padding-left: 0rem;
`
