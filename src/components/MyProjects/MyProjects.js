import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: '5px',
    padding: '20px',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    margin: 'auto',
    width: '850px',
    height: '650px'
  },
  title: {
    display: 'flex',
    marginTop: '8px',
    marginBottom: '8px',
    marginLeft: '16px',
    fontWeight: '400',
    lineHeight: '1.334',
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  },
  divider: {
    margin: '4px 0',
  },
  tr: {
    cursor: 'pointer',
    "&:hover": {
      backgroundColor: theme.palette.primary.grey,
    }
  }
}));

const MyProjects = ({
  projects,
  onProjectSelection,
}) => {
  const classes = useStyles();

  const headerGroups = ['Name', 'Last Opened'];

  return (
    <Paper classes={{ root: classes.paper }}>
      <div className={classes.root}>
        <h2 className={classes.title}>My Projects</h2>
        <Divider className={classes.divider}/>
        <MaUTable>
          <TableHead>
            <TableRow>
              {headerGroups.map((headerGroup, i) => (
                <TableCell key={i}>
                  <b>{headerGroup}</b>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project, i) => {
              const { name, timestamp } = project;

              return (
                <TableRow key={i} className={classes.tr} onClick={() => onProjectSelection(project)}>
                  <TableCell>
                    {name}
                  </TableCell>
                  <TableCell>
                    {moment().to(timestamp)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </MaUTable>
      </div>
    </Paper>
  );
};

MyProjects.defaultProps = {
  projects: []
}

MyProjects.propTypes = {
  projects: PropsTypes.array.isRequired,
  onProjectSelection: PropsTypes.func.isRequired,
};

export default MyProjects;
