import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/index.js';
import watch from './utils/watcher.js';
import validate from './utils/validator.js';
import { mappingLoadingState, mappingFormState, mappingModalState } from './utils/mappingStates.js';
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
        state.form.state = mappingFormState.invalid;
        handleError(err, state);
      })
      .finally(() => {
        state.form.state = mappingFormState.filling;
      });
    updatePostsByTimer(state);
  });

  [...elements.closeButtons, elements.modal].forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if ([...e.target.classList].includes('modal') || e.target.dataset.bsDismiss) {
        state.ui.modal = {
          state: mappingModalState.closed,
          activePost: null,
        };
      }
    });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const postButton = e.target;
    const postId = postButton.dataset.id;
    if (!postId) return;
    const activePost = state.data.posts.find(({ id }) => id === postId);

    state.ui.modal = {
      state: mappingModalState.open,
      activePost,
    };

    const { seenPostsIds } = state.ui;
    if (!seenPostsIds.includes(postId)) {
      state.ui.seenPostsIds.push(postId);
    }
  });
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
            state: mappingModalState.initial,
            activePost: null,
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
    .catch((e) => console.log(e));
};
