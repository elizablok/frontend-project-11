import { isEmpty, last } from 'lodash';
import { mappingFormState, mappingLoadingState, mappingModalState } from './mappingStates.js';

const blockUI = (elements) => {
  const { input, submitButton } = elements;
  submitButton.setAttribute('disabled', 'disabled');
  input.readOnly = true;
};

const unblockUI = (elements) => {
  const { submitButton, input } = elements;
  submitButton.disabled = false;
  input.readOnly = false;
};

const openModal = (post, elements) => {
  elements.body.classList.add('modal-open');
  elements.body.setAttribute('style', 'overflow: hidden; padding-right: 15px;');

  elements.modal.classList.add('show');
  elements.modal.style = 'display: block;';
  elements.modal.removeAttribute('aria-hidden');
  elements.modal.setAttribute('aria-modal', 'true');
  elements.modal.setAttribute('role', 'dialog');

  const backDrop = document.createElement('div');
  backDrop.classList.add('modal-backdrop', 'fade', 'show');
  elements.body.append(backDrop);

  elements.modalTitle.textContent = post.title;
  elements.modalBody.innerHTML = post.description;
  elements.readinFullButton.setAttribute('href', post.link);
};

const closeModal = (elements) => {
  elements.body.classList.remove('modal-open');
  elements.body.removeAttribute('style');

  elements.modal.classList.remove('show');
  elements.modal.style = 'display: none;';
  elements.modal.removeAttribute('aria-modal');
  elements.modal.setAttribute('aria-hidden', 'true');
  elements.modal.removeAttribute('role');

  const backDrop = document.querySelector('.modal-backdrop');
  elements.body.removeChild(backDrop);
};

const clearInputField = (elements) => {
  const { input, feedback } = elements;
  input.classList.remove('is-valid', 'is-invalid');
  feedback.classList.remove('text-success', 'text-danger', 'text-warning');
  feedback.textContent = '';
};

const showInvalidInputField = (elements) => {
  clearInputField(elements);
  const { input, feedback } = elements;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
};

const showValidInputField = (elements, i18n) => {
  clearInputField(elements);
  const { feedback, input } = elements;
  input.classList.add('is-valid');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('loading.feedback.success');
};

const showProcessingInputField = (stateType, elements, i18n = null) => {
  if (stateType === 'form') {
    const { form, input } = elements;
    unblockUI(elements);
    form.reset();
    input.focus();
  } else if (stateType === 'loading') {
    const { feedback } = elements;
    feedback.classList.add('text-warning');
    feedback.textContent = i18n.t('loading.feedback.process');
  }
};

const renderPosts = (posts, seenPostsIds, elements, i18n) => {
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

const renderFeeds = (feeds, elements, i18n) => {
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

const renderError = (error, elements, i18n) => {
  console.log(error, !isEmpty(error), i18n.t(error));
  if (!isEmpty(error)) {
    const { feedback } = elements;
    feedback.textContent = i18n.t(error);
  }
};

const renderForm = (formState, elements) => {
  switch (formState) {
    case mappingFormState.valid:
      break;
    case mappingFormState.invalid:
      showInvalidInputField(elements);
      break;
    case mappingFormState.processing:
      clearInputField(elements);
      blockUI(elements);
      break;
    case mappingFormState.filling:
      showProcessingInputField('form', elements);
      break;
    default:
      unblockUI(elements);
      clearInputField(elements);
      throw new Error(`Unexpected state: ${formState}`);
  }
};

const renderLoading = (loadingState, elements, i18n) => {
  switch (loadingState) {
    case mappingLoadingState.processing:
      showProcessingInputField('loading', elements, i18n);
      break;
    case mappingLoadingState.failed:
      showInvalidInputField(elements);
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

const renderModal = (modals, elements) => {
  if (modals.state === mappingModalState.open) {
    openModal(modals.activePost, elements);
  } else if (modals.state === mappingModalState.closed) {
    closeModal(elements);
  }
};

const renderSeenPost = (seenPostsIds, elements) => {
  const postId = last(seenPostsIds);
  const postA = elements.postsContainer.querySelector(`a[data-id="${postId}"]`);
  postA.classList.remove('fw-bold');
  postA.classList.add('fw-normal');
};

export {
  renderForm, renderLoading, renderError,
  renderFeeds, renderPosts, renderModal, renderSeenPost,
};
