import * as yup from 'yup';

export default (url, urlsList) => {
  const schema = yup.object({
    url: yup
      .string()
      .url()
      .required()
      .notOneOf(urlsList),
  });

  return schema.validate(url);
};
