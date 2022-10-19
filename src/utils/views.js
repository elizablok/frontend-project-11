import { isEmpty, last } from 'lodash';

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
  const { input, feedback } = elements;
  clearInputField(elements);
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
};

const showValidInputField = (elements, i18n) => {
  const { form, feedback, input } = elements;
  clearInputField(elements);
  form.reset();
  input.focus();
  input.classList.add('is-valid');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('form.feedback.finished');
};

const showProcessingInputField = (elements, i18n) => {
  const { feedback } = elements;
  clearInputField(elements);
  feedback.classList.add('text-warning', 'm-0', 'small', 'feedback');
  feedback.textContent = i18n.t('form.feedback.loading');
};

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

const renderPosts = (posts, elements, i18n) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  elements.postsContainer.replaceChildren(card);

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h4');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('views.posts');
  cardBody.append(cardTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.classList.add('fw-bold');
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
    seeButton.textContent = i18n.t('buttons.see');
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
  feedsCardTitle.textContent = i18n.t('views.feeds');
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

const renderErrors = (errors, elements, i18n) => {
  if (!isEmpty(errors)) {
    const { feedback } = elements;
    feedback.textContent = errors.url.errors.map((message) => i18n.t(message)).join('. ');
  }
};

const renderValidation = (validationState, elements) => {
  switch (validationState) {
    case 'valid':
      break;
    case 'invalid':
      unblockUI(elements);
      showInvalidInputField(elements);
      break;
    case 'processing':
      clearInputField(elements);
      blockUI(elements);
      break;
    default:
      unblockUI(elements);
      clearInputField(elements);
      throw new Error(`Unexpected state: ${validationState}`);
  }
};

const renderLoading = (loadingState, elements, i18n) => {
  switch (loadingState) {
    case 'processing':
      showProcessingInputField(elements, i18n);
      break;
    case 'failed':
      unblockUI(elements);
      showInvalidInputField(elements);
      break;
    case 'successful':
      unblockUI(elements);
      showValidInputField(elements, i18n);
      break;
    default:
      unblockUI(elements);
      clearInputField(elements);
      throw new Error(`Unexpected state mode: ${loadingState}`);
  }
};

const renderModal = (modals, elements) => {
  if (modals.isOn) {
    openModal(modals.activePost, elements);
    const postA = elements.postsContainer.querySelector(`a[data-id="${modals.activePost.id}"]`);
    if ([...postA.classList].includes('fw-bold')) {
      postA.classList.remove('fw-bold');
      postA.classList.add('fw-normal');
    }
  } else {
    closeModal(elements);
  }
};

const renderSeenPosts = (seenPosts, elements) => {
  const post = last(seenPosts);
  const postA = elements.postsContainer.querySelector(`a[data-id="${post.id}"]`);
  postA.classList.add('fw-normal');
};

export {
  renderValidation, renderLoading, renderErrors,
  renderFeeds, renderPosts, renderModal, renderSeenPosts,
};
