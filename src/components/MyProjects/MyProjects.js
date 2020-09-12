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
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Delete from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import moment from 'moment';
import generateTimestamp from '../../helpers/generateTimestamp';
import NoData from '../../assets/images/undraw_no_data.svg'

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
    minHeight: '650px'
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
    "&:hover": {
      backgroundColor: theme.palette.primary.grey,
    }
  },
  openButton: {
    width: '100%',
    margin: '0px',
  },
  button: {
    alignSelf: 'center',
    width: '400px',
    margin: '20px',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  image: {
    height: '400px',
    margin: '30px',
  },
  settingsTd: {
    display: 'flex',
    justifyContent: 'flex-end',
  }
}));

const MyProjects = ({
  projects,
  deleteProject,
  toggleProjects,
  onProjectSelection,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [projectClicked, setProjectClicked] = React.useState('');
  const open = Boolean(anchorEl);

  const handleClick = (event, name) => {
    setProjectClicked(name);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onDeleteProject = () => {
    handleClose();
    deleteProject(projectClicked);
  }

  const headerGroups = ['Name', 'Last Opened'];

  return (
    <Paper classes={{ root: classes.paper }}>
      <div className={classes.root}>
        <h2 className={classes.title}>My Projects</h2>
        <Divider className={classes.divider}/>
        {projects.length ?
          <MaUTable>
            <TableHead>
              <TableRow>
                {headerGroups.map((headerGroup, i) => (
                  <TableCell key={i}>
                    <b>{headerGroup}</b>
                  </TableCell>
                ))}
                <TableCell key="td-actions-button">
                  {' '}
                </TableCell>
                <TableCell key="td-actions2-button">
                  {' '}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project, i) => {
                const { name, timestamp } = project;

                return (
                  <TableRow key={i} className={classes.tr}>
                    <TableCell>
                      {name}
                    </TableCell>
                    <TableCell>
                      {moment().to(timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button
                        className={classes.openButton}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          project.timestamp = generateTimestamp();
                          onProjectSelection(project);
                        }}
                      >
                        Open
                      </Button>
                    </TableCell>
                    <TableCell className={classes.settingsTd}>
                      <IconButton
                        aria-label="more"
                        aria-controls="long-menu"
                        aria-haspopup="true"
                        onClick={(e) => handleClick(e, name)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </MaUTable>
          :
          <div className={classes.empty}>
            <h2 className={classes.emptyMessage}>You have not started a project...</h2>
            <img src={NoData} className={classes.image} alt="No projects started"/>
          </div>
        }
        <Button className={classes.button} variant="contained" color="primary" onClick={() => toggleProjects(false)}>
          Start a New Project
        </Button>
      </div>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 48 * 4.5,
            width: '20ch',
          },
        }}
      >
        <MenuItem
          key='delete-project-menu-item'
          onClick={onDeleteProject}
        >
          <Delete/> Delete Project
        </MenuItem>
      </Menu>
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
