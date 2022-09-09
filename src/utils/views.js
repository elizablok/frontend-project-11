import { isEmpty } from 'lodash';

export const renderInput = (elements, value, prevValue) => {
  if (!value) {
    if (prevValue || prevValue === null) {
      elements.input.classList.add('is-invalid');
    }
  } else if (value && !prevValue) {
    elements.input.classList.remove('is-invalid');
    elements.input.classList.add('is-valid');
  }
};

export const renderInputFeedback = (elements, value, prevValue, i18n) => {
  if (!isEmpty(value)) {
    if (prevValue === null) {
      elements.feedback.classList.add('text-danger');
    } else if (isEmpty(prevValue)) {
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
    }
    elements.feedback.textContent = value.url.errors.join('. ');
  } else if (isEmpty(value)) {
    if (prevValue === null) {
      elements.feedback.classList.add('text-success');
    } else if (!isEmpty(prevValue)) {
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
    }
    elements.feedback.textContent = i18n.t('form.alerts.finished');
  }
};

const renderPost = (post, elements) => {
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

  [...elements.closeButtons, elements.modal].forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if ([...e.target.classList].includes('modal') || e.target.dataset.bsDismiss) {
        elements.body.classList.remove('modal-open');
        elements.body.removeAttribute('style');

        elements.modal.classList.remove('show');
        elements.modal.style = 'display: none;';
        elements.modal.removeAttribute('aria-modal');
        elements.modal.setAttribute('aria-hidden', 'true');
        elements.modal.removeAttribute('role');

        elements.body.removeChild(backDrop);
      }
    });
  });
};

export const renderPosts = (posts, elements, i18n) => {
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
    a.classList.add('fw-bold', 'link-secondary');
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
    seeButton.addEventListener('click', (e) => {
      renderPost(post, elements, i18n);
      const postA = e.target.closest('li').querySelector('a');
      if ([...postA.classList].includes('fw-bold')) {
        postA.classList.remove('fw-bold');
        postA.classList.add('fw-normal');
      }
    });
    li.append(a, seeButton);
    postsList.append(li);
  });

  card.append(cardBody, postsList);
};

export const renderFeeds = (feeds, elements, i18n) => {
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
