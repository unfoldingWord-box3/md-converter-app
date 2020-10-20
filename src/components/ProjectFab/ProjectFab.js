import React from 'react';
import PropsTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CheckBoxRoundedIcon from '@material-ui/icons/CheckBoxRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import GetAppIcon from '@material-ui/icons/GetApp';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Fab from '@material-ui/core/Fab';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  bottom: 10px;
  right: 0%;
  margin: 0px 15px;
  margin-left: -50px;
  z-index: 2;
  cursor: pointer;
  text-align: center;

  &:hover {
    opacity: 1;
    animation: wiggle 1s ease;
    animation-iteration-count: 1;
  }

  @keyframes wiggle {
    20% { transform: translateY(6px); }
    40% { transform: translateY(-6px); }
    60% { transform: translateY(4px); }
    80% { transform: translateY(-2px); }
    100% { transform: translateY(0); }
  }
`

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export default function ProjectFab({
  records,
  saveBackup,
  savedBackup,
  exportProject,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container>
      <Fab color="primary" size="medium" aria-label="add" onClick={handleClick}>
        <MoreVertIcon />
      </Fab>
      {anchorEl &&
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <StyledMenuItem
            onClick={() => {
              handleClose();
              saveBackup();
            }}
          >
            <ListItemIcon>
              {savedBackup ? <CheckBoxRoundedIcon htmlColor='green' fontSize="small" /> : <GetAppIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary="Save Backup" />
          </StyledMenuItem>
          <StyledMenuItem
            onClick={() => {
              handleClose();
              exportProject(records);
            }}
          >
            <ListItemIcon>
              <SaveAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Export To TSV" />
          </StyledMenuItem>
        </StyledMenu>
      }
    </Container>
  );
}

ProjectFab.propTypes = {
  records: PropsTypes.array.isRequired,
  saveBackup: PropsTypes.func.isRequired,
  savedBackup: PropsTypes.bool.isRequired,
  exportProject: PropsTypes.func.isRequired,
};
