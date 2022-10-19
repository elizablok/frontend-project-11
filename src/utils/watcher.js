import onChange from 'on-change';
import {
  renderValidation, renderLoading, renderErrors,
  renderFeeds, renderPosts, renderModal, renderSeenPosts,
} from './views.js';

export default (state, elements, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'rssForm.validationState':
      renderValidation(value, elements);
      break;

    case 'rssForm.loadingState':
      renderLoading(value, elements, i18n);
      break;

    case 'rssForm.errors':
      renderErrors(value, elements, i18n);
      break;

    case 'rssForm.feeds':
      renderFeeds(value, elements, i18n);
      break;

    case 'rssForm.posts':
      renderPosts(value, elements, i18n);
      break;

    case 'rssForm.modal':
      renderModal(value, elements);
      break;

    case 'rssForm.seenPostsIds':
      renderSeenPosts(value, elements);
      break;

    default:
      break;
  }
});
