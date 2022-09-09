import i18next from 'i18next';
import onChange from 'on-change';
import { isEmpty, keyBy, uniqueId } from 'lodash';
import axios from 'axios';
import ru from './locales/ru.js';
import parse from './utils/parser.js';
import {
  renderInput, renderInputFeedback, renderFeeds, renderPosts,
} from './utils/views.js';
import proxify from './utils/proxy.js';
import validate from './utils/validator.js';

const render = (elements, i18nInstance) => (path, value, prevValue) => {
  switch (path) {
    case 'rssForm.isValid':
      renderInput(elements, value, prevValue);
      break;

    case 'rssForm.errors':
      renderInputFeedback(elements, value, prevValue, i18nInstance);
      break;

    case 'rssForm.feeds':
      renderFeeds(value, elements, i18nInstance);
      break;

    case 'rssForm.posts':
      renderPosts(value, elements, i18nInstance);
      break;

    default:
      break;
  }
};

const errorHandler = (err, state, i18n) => {
  state.rssForm.isValid = false;
  if (err.name === 'ValidationError') {
    state.rssForm.errors = keyBy([err], 'path');
  } else if (err.invalidRss) {
    state.rssForm.errors = {
      url: {
        errors: [i18n.t('form.errors.url.invalidResource')],
      },
    };
  } else {
    state.rssForm.errors = {
      url: {
        errors: [i18n.t('form.alerts.crashed')],
      },
    };
  }
};

const createFeed = (feedData, url) => {
  const id = uniqueId();
  const { title, description } = feedData;
  return {
    id, title, description, url,
  };
};

const createPosts = (feedData) => feedData.posts.map((post) => {
  const id = uniqueId();
  return { id, ...post };
});

const updatePosts = (state, url) => {
  const proxified = proxify(url);
  return axios.get(proxified)
    .then(({ data }) => {
      const feedData = parse(data.contents);

      state.rssForm.isValid = true;
      state.rssForm.errors = {};

      const newFeed = createFeed(feedData, url);
      state.rssForm.feeds.unshift(newFeed);
      const newPosts = createPosts(feedData);
      state.rssForm.posts.unshift(...newPosts);
    });
};

const updatePostsByTimer = (state) => {
  setTimeout(() => {
    const feedsUrls = state.rssForm.feeds.map(({ url }) => url);
    feedsUrls.forEach((feedUrl) => {
      const proxified = proxify(feedUrl);
      return axios.get(proxified)
        .then(({ data }) => {
          const feedData = parse(data.contents);
          const postsLinks = state.rssForm.posts.map(({ link }) => link);
          const newPostsData = feedData.posts.filter((post) => !postsLinks.includes(post.link));
          if (!isEmpty(newPostsData)) {
            feedData.posts = newPostsData;
            const newPosts = createPosts(feedData);
            state.rssForm.posts.unshift(...newPosts);
          }
        });
    });
    updatePostsByTimer(state);
  }, 5000);
};

export default () => {
  const elements = {
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    body: document.querySelector('body'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: document.querySelector('div.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    readinFullButton: document.querySelector('a.full-article'),
    closeButtons: document.querySelectorAll('button[data-bs-dismiss="modal"]'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  });

  const state = onChange({
    rssForm: {
      isValid: null,
      feeds: [],
      posts: [],
      errors: null,
    },
  }, render(elements, i18nInstance));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const urlsList = state.rssForm.feeds.map(({ url }) => url);
    validate(Object.fromEntries(formData), urlsList, i18nInstance)
      .then(() => updatePosts(state, formData.get('url')))
      .then(() => updatePostsByTimer(state))
      .catch((err) => errorHandler(err, state, i18nInstance));
  });
};
