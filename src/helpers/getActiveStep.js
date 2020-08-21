export function getActiveStep(completed) {
  const stepValues = Object.values(completed);
  const firstIncompleteStep = stepValues.findIndex((_, index) => {
    return !stepValues[index];
  });
  const newActiveStep = firstIncompleteStep === -1 ? stepValues.length : firstIncompleteStep;
  return newActiveStep;
}
