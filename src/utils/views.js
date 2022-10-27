import { isEmpty, last } from 'lodash';
import { mappingFormState, mappingLoadingState } from './mappingStates.js';

const blockUI = (elements) => {
  const { input, submitButton } = elements;
  submitButton.setAttribute('disabled', 'disabled');
  input.readOnly = true;
};

const unblockUI = (elements) => {
  const { submitButton, input } = elements;
  submitButton.removeAttribute('disabled');
  input.readOnly = false;
};

const openModal = (post, elements) => {
  elements.modalTitle.textContent = post.title;
  elements.modalBody.innerHTML = post.description;
  elements.readinFullButton.setAttribute('href', post.link);
};

const clearInputField = (elements) => {
  const { input, feedback } = elements;
  input.classList.remove('is-valid', 'is-invalid');
  feedback.classList.remove('text-success', 'text-danger', 'text-warning');
  feedback.textContent = '';
};

const showInvalidInputField = (error, elements, i18n) => {
  const { input, feedback } = elements;
  clearInputField(elements);
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  if (!isEmpty(error)) {
    feedback.textContent = i18n.t(error);
  }
};

const showValidInputField = (elements, i18n) => {
  const { feedback, input } = elements;
  clearInputField(elements);
  input.classList.add('is-valid');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('loading.feedback.success');
  input.value = '';
};

const showFillingInputField = (elements) => {
  const { input } = elements;
  unblockUI(elements);
  input.focus();
};

const showLoadingInputField = (elements, i18n) => {
  const { feedback } = elements;
  feedback.classList.add('text-warning');
  feedback.textContent = i18n.t('loading.feedback.process');
};

const renderPosts = (state, elements, i18n) => {
  const { posts } = state.data;
  const { seenPostsIds } = state.ui;
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  elements.postsContainer.replaceChildren(card);

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h4');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('views.posts.title');
  cardBody.append(cardTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    const fontClass = `fw-${seenPostsIds.includes(post.id) ? 'normal' : 'bold'}`;
    a.classList.add(fontClass);
    a.dataset.id = post.id;
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener', 'noreferrer');
    a.textContent = post.title;
    const seeButton = document.createElement('button');
    seeButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    seeButton.setAttribute('type', 'button');
    seeButton.dataset.id = post.id;
    seeButton.dataset.bsToggle = 'modal';
    seeButton.dataset.bsTarget = '#modal';
    seeButton.textContent = i18n.t('views.posts.buttons.see');
    li.append(a, seeButton);
    postsList.append(li);
  });

  card.append(cardBody, postsList);
};

const renderFeeds = (state, elements, i18n) => {
  const { feeds } = state.data;
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  elements.feedsContainer.replaceChildren(feedsCard);

  const feedsCardBody = document.createElement('div');
  feedsCardBody.classList.add('card-body');

  const feedsCardTitle = document.createElement('h4');
  feedsCardTitle.classList.add('card-title', 'h4');
  feedsCardTitle.textContent = i18n.t('views.feeds.title');
  feedsCardBody.append(feedsCardTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;
    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.innerHTML = feed.description;
    li.append(title, description);
    feedsList.append(li);
  });

  feedsCard.append(feedsCardBody, feedsList);
};

const renderForm = (state, elements, i18n) => {
  const formState = state.form.state;
  const formError = state.form.error;
  switch (formState) {
    case mappingFormState.valid:
      break;
    case mappingFormState.invalid:
      showInvalidInputField(formError, elements, i18n);
      break;
    case mappingFormState.processing:
      clearInputField(elements);
      blockUI(elements);
      break;
    case mappingFormState.filling:
      showFillingInputField(elements);
      break;
    default:
      unblockUI(elements);
      clearInputField(elements);
      throw new Error(`Unexpected state: ${formState}`);
  }
};

const renderLoading = (state, elements, i18n) => {
  const loadingState = state.loading.state;
  const loadingError = state.loading.error;
  switch (loadingState) {
    case mappingLoadingState.processing:
      showLoadingInputField(elements, i18n);
      break;
    case mappingLoadingState.failed:
      showInvalidInputField(loadingError, elements, i18n);
      break;
    case mappingLoadingState.done:
      showValidInputField(elements, i18n);
      break;
    default:
      unblockUI(elements);
      clearInputField(elements);
      throw new Error(`Unexpected state mode: ${loadingState}`);
  }
};

const renderModal = (state, elements) => {
  const { activePostId } = state.ui.modal;
  if (activePostId !== null) {
    const activePost = state.data.posts.find((post) => post.id === activePostId);
    openModal(activePost, elements);
  }
};

const renderSeenPost = (state, elements) => {
  const { seenPostsIds } = state.ui;
  const postId = last(seenPostsIds);
  const postA = elements.postsContainer.querySelector(`a[data-id="${postId}"]`);
  postA.classList.remove('fw-bold');
  postA.classList.add('fw-normal');
};

export {
  renderForm, renderLoading,
  renderFeeds, renderPosts, renderModal, renderSeenPost,
};
