const mappingFormState = {
  initial: 'filling',
  filling: 'filling',
  processing: 'pending',
  valid: 'valid',
  invalid: 'invalid',
};

const mappingLoadingState = {
  initial: 'idle',
  processing: 'pending',
  done: 'done',
  failed: 'failed',
};

const mappingModalState = {
  initial: 'closed',
  open: 'open',
  closed: 'closed',
};

export { mappingFormState, mappingLoadingState, mappingModalState };
