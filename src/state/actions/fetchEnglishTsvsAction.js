import * as cacheLibrary from 'money-clip';
import getManifest from '../../helpers/getManifest';

async function fetchTsvs(url) {
  const { tree } = await fetch(url).then(data => data.json());

  return tree.filter(item => item.path.includes('.tsv') || item.path === 'manifest.yaml');
}

export default async function fetchEnglishTsvsAction(reducerName) {
  console.info('fetching English TSVs...')
  let result = {};

  try {
    if (navigator.onLine) {
      const tsvs = await fetchTsvs('https://git.door43.org/api/v1/repos/unfoldingWord/en_tn/git/trees/master');

      tsvs.forEach(async ({ path, url }) => {
        const isManifest = path === 'manifest.yaml';
        const bookId = !isManifest ?
          path.split('-')[1].replace('.tsv', '').toLowerCase() : path.replace('.yaml', '').toLowerCase();

        if (isManifest) {
          console.log('====================================');
          console.log('isManifest');
          console.log('url', url);
          console.log('====================================');
          url = await getManifest(url);
          console.log('====================================');
          console.log(typeof url, url);
          console.log('====================================');
        }

        result[bookId] = url;
      });

      return result;
    } else {
      result = await cacheLibrary.getAll().then(
        cacheData => {
          return cacheData[reducerName]?.glTsvs?.en;
        }
      );

      return result;
    }
  } catch (error) {
    console.error(error);
  }
}
