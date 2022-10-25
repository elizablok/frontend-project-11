import onChange from 'on-change';
import {
  renderForm, renderLoading,
  renderFeeds, renderPosts, renderModal, renderSeenPost,
} from './views.js';

export default (state, elements, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.state':
      renderForm(value, state.form.error, elements, i18n);
      break;

    case 'loading.state':
      renderLoading(value, state.loading.error, elements, i18n);
      break;

    case 'data.feeds':
      renderFeeds(value, elements, i18n);
      break;

    case 'data.posts':
      renderPosts(value, state.ui.seenPostsIds, elements, i18n);
      break;

    case 'ui.modal':
      renderModal(value, elements);
      break;

    case 'ui.seenPostsIds':
      renderSeenPost(value, elements);
      break;

    default:
      break;
  }
});
