import mdToJson from '../../helpers/md2json';

export default async function fetchTnMarkdownAction(dispatch, bookUrl, bookId) {
  console.log('fetchTnMarkdown()');
  console.time('markdownToJson')
  const data = await fetch(bookUrl);
  const bookData = await data.json();
  const chapters = bookData.tree;
  const result = {};

  for (let index = 0; index < chapters.length; index++) {
    const chapter = chapters[index];
    let { path: chapterNumber, url: chapterUrl } = chapter;
    chapterNumber = parseNumber(chapterNumber);
    const data = await fetch(chapterUrl);
    const chapterData = await data.json();
    const verses = chapterData.tree;

    for (let index = 0; index < verses.length; index++) {
      const verse = verses[index];
      let { path: verseNumber, url: verseUrl } = verse;
      verseNumber = parseNumber(verseNumber);
      const data = await fetch(verseUrl);
      const verseData = await data.json();
      const { content } = verseData;
      const markdown = base64DecodeUnicode(content);
      const tnJson = convertMarkdownToJson(markdown)

      result[chapterNumber] = {
        ...result[chapterNumber],
        [verseNumber]: tnJson
      }
    }
  }
  console.timeEnd('markdownToJson')

  console.log('====================================');
  console.log('bookId', bookId);
  console.log('result', result);
  console.log('====================================');

  dispatch({
    type: "FETCH_TN_DATA",
    bookId,
    payload: result,
  })
}

function parseNumber(number) {
  if (number.includes('.')) number = number.split('.').slice(0, -1).join('.')
  const result = typeof number === 'number' || !isNaN(parseInt(number)) ?
    parseInt(number) : number;
  return result;
}

function base64DecodeUnicode(str) {
  // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
  const percentEncodedStr = atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join('');

  return decodeURIComponent(percentEncodedStr);
}

function convertMarkdownToJson(markdown) {
  const tnJson = {};
  let json = {};

  try {
    json = mdToJson.parse(markdown);
  } catch (error) {
    json = { '': { raw: markdown } }
    console.error(error);
  }

  Object.keys(json).forEach((heading) => {
    const { occurrence, raw } = json[heading];
    tnJson[occurrence || 1] = {
      heading,
      raw
    }
  })

  return tnJson;
}
