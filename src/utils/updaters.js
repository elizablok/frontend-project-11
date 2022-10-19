import { isEmpty, uniqueId } from 'lodash';
import parse from './parser.js';
import proxify from './proxy.js';
import fetch from './fetcher.js';
import { mappingLoadingState } from './mappingStates.js';
import { handleLoaingError } from './cathers.js';

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
  state.rssForm.loadingState = mappingLoadingState.processing;

  const proxifiedUrl = proxify(url);
  return fetch(proxifiedUrl)
    .then((data) => {
      const feedData = parse(data);
      const newFeed = createFeed(feedData, url);

      state.rssForm.feeds.unshift(newFeed);

      const newPosts = createPosts(feedData);

      state.rssForm.posts.unshift(...newPosts);
      state.rssForm.loadingState = mappingLoadingState.done;
    })
    .catch((e) => handleLoaingError(e, url, state));
};

const updatePostsByTimer = (state) => {
  state.rssForm.loadingState = mappingLoadingState.processing;

  let url = '';
  const feedsUrls = state.rssForm.feeds.map((feed) => feed.url);
  const promises = feedsUrls.map((feedUrl) => {
    url = feedUrl;
    const proxifiedUrl = proxify(feedUrl);
    return fetch(proxifiedUrl)
      .then((data) => {
        const feedData = parse(data);
        const postsLinks = state.rssForm.posts.map(({ link }) => link);
        const newPostsData = feedData.posts.filter((post) => !postsLinks.includes(post.link));
        if (!isEmpty(newPostsData)) {
          feedData.posts = newPostsData;
          const newPosts = createPosts(feedData);

          state.rssForm.posts.unshift(...newPosts);
        }

        state.rssForm.loadingState = mappingLoadingState.done;
      })
      .catch((e) => handleLoaingError(e, url, state));
  });
  Promise.all(promises)
    .finally(setTimeout(updatePostsByTimer, 5000, state));
};

export { updatePosts, updatePostsByTimer };
