import { object, string, setLocale } from 'yup';
import axios from 'axios';
import proxify from './proxy.js';

export const isValidRss = (link) => {
  const proxifiedUrl = proxify(link);
  return axios.get(proxifiedUrl)
    .then((data) => {
      const contentType = data.data.status.content_type;
      if (contentType.includes('rss')) {
        return true;
      }
      return false;
    });
};

export default (url, urlsList) => {
  setLocale({
    string: {
      url: 'form.errors.url.invalid',
      validRss: 'form.errors.url.invalidResource',
    },
    mixed: {
      required: 'form.errors.url.required',
      notOneOf: 'form.errors.url.feedAlreadyExists',
    },
  });

  const schema = object({
    url: string()
      .url()
      .required()
      .notOneOf(urlsList)
      .test({
        name: 'validRss',
        test: (link) => {
          if (!isValidRss(link)) {
            const error = new Error('Invalid RSS Resource');
            error.invalidRss = true;
            throw error;
          }
          return true;
        },
      }),
  });

  return schema.validate(url);
};
