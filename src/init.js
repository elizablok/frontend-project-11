import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './utils/watcher.js';
import validate from './utils/validator.js';
import {
  mappingLoadingState, mappingFormState,
} from './utils/mappingStates.js';
import handleError from './utils/cathers.js';
import { updatePosts, updatePostsByTimer } from './utils/updaters.js';

const runApp = (state, elements) => {
  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const urlsList = state.data.feeds.map(({ url }) => url);

    state.form.state = mappingFormState.processing;

    validate(Object.fromEntries(formData), urlsList)
      .then(() => {
        state.form.state = mappingFormState.valid;
        state.form.error = null;

        updatePosts(state, formData.get('url'));
      })
      .catch((err) => {
        handleError(err, state);
        state.form.state = mappingFormState.invalid;
      })
      .finally(() => {
        state.form.state = mappingFormState.filling;
      });
  });

  [...elements.closeButtons, elements.modal].forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (e.target.id === 'modal' || e.target.dataset.bsDismiss) {
        state.ui.modal = {
          activePostId: null,
        };
      }
    });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const postButton = e.target;
    const activePostId = postButton.dataset.id;
    if (!activePostId) return;

    state.ui.modal = {
      activePostId,
    };

    if (!new Set(state.ui.seenPostsIds).has(activePostId)) {
      state.ui.seenPostsIds.push(activePostId);
    }
  });

  updatePostsByTimer(state);
};

export default () => {
  yup.setLocale({
    string: {
      url: 'form.errors.invalidUrl',
    },
    mixed: {
      required: 'form.errors.required',
      notOneOf: 'form.errors.alreadyExists',
    },
  });

  const i18nInstance = i18next.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        data: {
          feeds: [],
          posts: [],
        },
        form: {
          state: mappingFormState.initial,
          error: null,
        },
        loading: {
          error: null,
          state: mappingLoadingState.initial,
        },
        ui: {
          seenPostsIds: [],
          modal: {
            activePostId: null,
          },
        },
      };

      const elements = {
        input: document.querySelector('#url-input'),
        feedback: document.querySelector('.feedback'),
        form: document.querySelector('.rss-form'),
        submitButton: document.querySelector('.rss-form button[type="submit"]'),
        body: document.querySelector('body'),
        postsContainer: document.querySelector('.posts'),
        feedsContainer: document.querySelector('.feeds'),
        modal: document.querySelector('div.modal'),
        modalTitle: document.querySelector('.modal-title'),
        modalBody: document.querySelector('.modal-body'),
        readinFullButton: document.querySelector('a.full-article'),
        closeButtons: document.querySelectorAll('button[data-bs-dismiss="modal"]'),
      };

      const watchedState = watch(state, elements, i18nInstance);

      runApp(watchedState, elements);
    })
    .catch((e) => console.error(e));
};
