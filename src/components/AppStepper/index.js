import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {
  RepositoryContext,
  AuthenticationContext,
} from "gitea-react-toolkit";
import BooksList from '../BooksList';
import useFetch from '../../hooks/useFetch';
import LoadingIndicator from '../LoadingIndicator';
import markdownToJson from "../../helpers/markdownToJson";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

function getSteps() {
  return ['Login', 'Pick a Project', 'Pick a Bible Book'];
}

function StepContent({
  activeStep,
}) {
  const { component: authComponent } = useContext(AuthenticationContext);
  const { state: repo, component: repoComponent } = useContext(RepositoryContext);
  const { tree_url } = repo || {};
  const { data, isLoading, isError } = useFetch(tree_url);

  if (isError) {
    return <h1>Something went wrong ...</h1>;
  } else if (isLoading) {
    return (
      <LoadingIndicator/>
    );
  }

  switch (activeStep) {
    case 0:
      return (<div style={{ width: '800px', margin: 'auto' }}>{authComponent}</div>);
    case 1:
      return (<div style={{ width: '1000px', margin: 'auto' }}>{repoComponent}</div>);
    case 2:
      return (
        <BooksList
          files={data?.tree}
          onItemClick={(book, url) => {
            // TODO: Move up the component tree
            console.log(book, url)
            markdownToJson(url);
          }}
        />
      );
    default:
      return 'Unknown activeStep';
  }
}

export default function HorizontalLabelPositionBelowStepper({
  repository,
  authentication,
}) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();

  useEffect(() => {
    if (!repository && authentication) {
      setActiveStep(1);
    } else if (repository && authentication) {
      setActiveStep(2);
    }
  }, [authentication, repository])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>All steps completed</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <Typography className={classes.instructions}>
              <StepContent activeStep={activeStep}/>
            </Typography>
            <div>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}
              >
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
