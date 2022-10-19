import { keyBy } from 'lodash';
import { mappingValidationState, mappingLoadingState } from './mappingStates.js';
import { isValidRss } from './validator.js';

const handleError = (err, state) => {
  state.rssForm.validationState = mappingValidationState.invalid;

  if (err.name === 'ValidationError') {
    state.rssForm.errors = keyBy([err], 'path');
  } else if (err.invalidRss) {
    state.rssForm.errors = {
      url: {
        errors: ['form.errors.url.invalidResource'],
      },
    };
  } else {
    state.rssForm.errors = {
      url: {
        errors: ['form.feedback.crashed'],
      },
    };
  }
};

const handleLoaingError = (e, url, state) => {
  state.rssForm.loadingState = mappingLoadingState.failed;

  let error = e;
  if (isValidRss(url)) {
    error = new Error('Network Error');
    error.networkError = true;
  }
  handleError(error, state);
};

export { handleError, handleLoaingError };
