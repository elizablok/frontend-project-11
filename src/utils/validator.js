import { object, string, setLocale } from 'yup';

export default (url, urlsList, i18n) => {
  setLocale({
    string: {
      url: i18n.t('form.errors.url.invalid'),
    },
    mixed: {
      required: i18n.t('form.errors.url.required'),
      notOneOf: i18n.t('form.errors.url.feedAlreadyExists'),
    },
  });

  const schema = object({
    url: string().required().url().notOneOf(urlsList),
  });

  return schema.validate(url);
};
