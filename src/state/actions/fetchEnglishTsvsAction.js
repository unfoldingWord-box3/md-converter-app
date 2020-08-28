import * as cacheLibrary from 'money-clip';

async function fetchTsvs(url) {
  const { tree } = await fetch(url).then(data => data.json());

  return tree.filter(item => item.path.includes('.tsv'));
}

export default async function fetchEnglishTsvsAction(reducerName) {
  console.info('fetchEnglishTsvsAction')

  try {
    if (navigator.onLine) {
      const result = {};
      const tsvs = await fetchTsvs('https://git.door43.org/api/v1/repos/unfoldingWord/en_tn/git/trees/master');

      tsvs.forEach(({ path, url }) => {
        const bookId = path.split('-')[1].replace('.tsv', '').toLowerCase();

        result[bookId] = url;
      });

      return result;
    } else {
      cacheLibrary.getAll().then(
        cacheData => {
          return cacheData[reducerName]?.glTsvs?.en;
        }
      );
    }
  } catch (error) {
    console.error(error);
  }
}
