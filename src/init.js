import i18next from 'i18next';
import ru from './locales/ru.js';
import watch from './utils/watcher.js';
import validate from './utils/validator.js';
import { mappingValidationState } from './utils/mappingStates.js';
import { handleError } from './utils/cathers.js';
import { updatePosts, updatePostsByTimer } from './utils/updaters.js';

const runApp = (state, elements) => {
  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const urlsList = state.rssForm.feeds.map(({ url }) => url);

    state.rssForm.validationState = mappingValidationState.processing;

    validate(Object.fromEntries(formData), urlsList)
      .then(() => {
        state.rssForm.validationState = mappingValidationState.valid;
        state.rssForm.errors = {};

        updatePosts(state, formData.get('url'));
      })
      .catch((err) => handleError(err, state));
    updatePostsByTimer(state);
  });

  [...elements.closeButtons, elements.modal].forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if ([...e.target.classList].includes('modal') || e.target.dataset.bsDismiss) {
        state.rssForm.ui.modal = {
          isOn: false,
          activePost: null,
        };
      }
    });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const postButton = e.target;
    const postId = postButton.dataset.id;
    if (!postId) return;
    const activePost = state.rssForm.posts.find(({ id }) => id === postId);

    state.rssForm.ui.modal = {
      isOn: true,
      activePost,
    };

    const { seenPostsIds } = state.rssForm.ui;
    if (!seenPostsIds.includes(postId)) {
      state.rssForm.ui.seenPostsIds.push(postId);
    }
  });
};

export default () => {
  const i18nInstance = i18next.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  })
    .then(() => {
      const state = {
        rssForm: {
          validationState: null,
          loadingState: null,
          ui: {
            seenPostsIds: [],
            modal: {
              isOn: false,
              activePost: null,
            },
          },
          feeds: [],
          posts: [],
          errors: {},
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
