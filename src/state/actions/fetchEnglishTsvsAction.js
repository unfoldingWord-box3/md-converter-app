import getManifest from '../../helpers/getManifest';

async function fetchTsvs(url) {
  const { tree } = await fetch(url).then(data => data.json());

  return tree.filter(item => item.path.includes('.tsv') || item.path === 'manifest.yaml');
}

export default async function fetchEnglishTsvsAction(resourceId) {
  console.info('Fetching English TSVs...')
  let result = {};

  try {
    if (navigator.onLine) {
      let tsvs = []

      if (resourceId === 'tQ' || resourceId === 'tq') {
        tsvs = await fetchTsvs('https://git.door43.org/api/v1/repos/unfoldingWord/en_tq/git/trees/master');

      } else {
        tsvs = await fetchTsvs('https://git.door43.org/api/v1/repos/unfoldingWord/en_tn/git/trees/master');
      }

      tsvs.forEach(async ( { path, url }) => {
        const isManifest = path === 'manifest.yaml';
        const separator = path.includes('-') ? '-' : '_'
        const bookId = !isManifest ?
          path.split(separator)[1].replace('.tsv', '').toLowerCase() : path.replace('.yaml', '').toLowerCase();

        if (isManifest) {
          url = await getManifest(url);
        }

        result[bookId] = url;
      });

      return result;
    } else {
      return result;
    }
  } catch (error) {
    console.error(error);
  }
}
