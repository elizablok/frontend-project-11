const handleError = (e, state) => {
  if (e.name === 'ValidationError') {
    state.form.error = e.message;
  } else {
    const codedErrMessage = `loading.feedback.${e.isInvalidRss ? 'invalidRss' : 'failure'}`;
    state.loading.error = codedErrMessage;
  }
};

export default handleError;
