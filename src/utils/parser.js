export default (data) => {
  const dom = new DOMParser().parseFromString(data, 'application/xml');
  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    const error = new Error('ParseError');
    error.isInvalidRss = true;
    throw error;
  }

  const title = dom.querySelector('title').textContent;
  const description = dom.querySelector('description') ? dom.querySelector('description').textContent : '';

  const rawPosts = dom.querySelectorAll('item');
  const posts = [...rawPosts].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description') ? post.querySelector('description').textContent : '';
    const link = post.querySelector('link') ? post.querySelector('link').textContent : post.querySelector('a').textContent;
    return { title: postTitle, description: postDescription, link };
  });

  return { title, description, posts };
};
