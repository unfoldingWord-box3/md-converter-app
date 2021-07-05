import React, { useContext } from 'react';
import PropsTypes from 'prop-types';
import { RepositoryContext } from 'gitea-react-toolkit';
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
import MenuItem from '@material-ui/core/MenuItem';
import Delete from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import Menu from '@material-ui/core/Menu';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { formatDistanceToNowStrict, parseJSON } from 'date-fns';
import downloadProjectBackup from '../../helpers/downloadProjectBackup';
import generateTimestamp from '../../helpers/generateTimestamp';
import exportToTSV from '../../helpers/exportToTSV';
import NoData from '../../assets/images/undraw_no_data.svg';
import useLoading from '../../hooks/useLoading';
import BackdropLoadingIndicator from '../BackdropLoadingIndicator';

const useStyles = makeStyles((theme) => ({
  paper: {
    alignSelf: 'center',
    width: '100%',
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
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newProjectButton: {
    width: '220px',
    margin: '8px',
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
  },
  menuItem: {
    display: 'flex',
  },
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
  const { isLoading, setIsLoading } = useLoading();
  const { actions: { close: removeRepo } } = useContext(RepositoryContext);
  const open = Boolean(anchorEl);

  projects = projects.sort((x, y) => {
    return new Date(y.timestamp) - new Date(x.timestamp);
  });

  const startNewProject = () => {
    removeRepo()
    toggleProjects(false)
  }

  const handleClick = (event, name) => {
    setProjectClicked(name);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openProject = async (project) => {
    project.timestamp = generateTimestamp();
    onProjectSelection(project);
  }

  const onDeleteProject = () => {
    handleClose();
    deleteProject(projectClicked);
  }

  const onProjectBackup = async () => {
    setIsLoading(true);
    const projectBackup = projects.find(project => project.name === projectClicked);
    await downloadProjectBackup(projectBackup);
    handleClose();
    setIsLoading(false);
  }

  const onProjectExport = () => {
    const project = projects.find(project => project.name === projectClicked);
    const { sourceNotes, targetNotes, bookId, languageId } = project;
    exportToTSV(sourceNotes, targetNotes, bookId, languageId);
    handleClose();
  }

  const headerGroups = ['Name', 'Last Opened'];

  return (
    <Paper classes={{ root: classes.paper }}>
      {isLoading && <BackdropLoadingIndicator open={true} />}
      <div className={classes.root}>
        <div className={classes.titleContainer}>
          <h2 className={classes.title}>My Projects</h2>
          <Button className={classes.newProjectButton} variant="contained" color="primary" onClick={startNewProject}>
            Start a New Project
          </Button>
        </div>
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
                  <TableRow key={`${i}-${name}`} className={classes.tr}>
                    <TableCell>
                      {name}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNowStrict(parseJSON(timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button
                        className={classes.openButton}
                        variant="contained"
                        color="primary"
                        onClick={() => openProject(project)}
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
            <Button className={classes.button} variant="contained" color="primary" onClick={() => toggleProjects(false)}>
              Start a New Project
            </Button>
          </div>
        }
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
          className={classes.menuItem}
          key='delete-project-menu-item'
          onClick={onDeleteProject}
        >
          <ListItemIcon style={{ minWidth: "40px" }}>
            <Delete color="primary"/>
          </ListItemIcon>
          <Typography variant="inherit">Delete Project</Typography>
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          key='backup-project-menu-item'
          onClick={onProjectBackup}
        >
          <ListItemIcon style={{ minWidth: "40px" }}>
            <GetAppIcon color="primary"/>
          </ListItemIcon>
          <Typography variant="inherit">Save Backup</Typography>
        </MenuItem>
        <MenuItem
          className={classes.menuItem}
          key='backup-project-menu-item'
          onClick={onProjectExport}
        >
          <ListItemIcon style={{ minWidth: "40px" }}>
            <SaveAltIcon color="primary"/>
          </ListItemIcon>
          <Typography variant="inherit">Export to TSV</Typography>
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
