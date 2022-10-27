import onChange from 'on-change';
import {
  renderForm, renderLoading,
  renderFeeds, renderPosts, renderModal, renderSeenPost,
} from './views.js';

export default (state, elements, i18n) => onChange(state, (path) => {
  switch (path) {
    case 'form.state':
      renderForm(state, elements, i18n);
      break;

    case 'loading.state':
      renderLoading(state, elements, i18n);
      break;

    case 'data.feeds':
      renderFeeds(state, elements, i18n);
      break;

    case 'data.posts':
      renderPosts(state, elements, i18n);
      break;

    case 'ui.modal':
      renderModal(state, elements);
      break;

    case 'ui.seenPostsIds':
      renderSeenPost(state, elements);
      break;

    default:
      break;
  }
});
