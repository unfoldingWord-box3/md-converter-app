export default async function fetchContent(url) {
  const { content } = await fetch(url).then(data => data.json());

  return content;
}
