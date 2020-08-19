import axios from 'axios';
import mdToJson from './md2json';

export default async function markdownToJson(bookUrl) {
  console.log('markdownToJson()');
  console.time('markdownToJson')
  const { data: bookData } = await axios(bookUrl);
  const chapters = bookData.tree;
  const result = {};

  for (let index = 0; index < chapters.length; index++) {
    const chapter = chapters[index];
    let { path: chapterNumber, url: chapterUrl } = chapter;
    chapterNumber = parseNumber(chapterNumber);
    const { data: chapterData } = await axios(chapterUrl);
    const verses = chapterData.tree;

    for (let index = 0; index < verses.length; index++) {
      const verse = verses[index];
      let { path: verseNumber, url: verseUrl } = verse;
      verseNumber = parseNumber(verseNumber);
      const { data: verseData } = await axios(verseUrl);
      const { content } = verseData;
      const markdown = base64DecodeUnicode(content);
      const tnObject = {};
      let json = {};

      try {
        json = mdToJson.parse(markdown);
      } catch (error) {
        json = { '': { raw: markdown } }
        console.error(error);
      }

      Object.keys(json).forEach((heading) => {
        const { occurrence, raw } = json[heading];
        tnObject[occurrence || 1] = {
          heading,
          raw
        }
      })

      result[chapterNumber] = {
        ...result[chapterNumber],
        [verseNumber]: tnObject
      }
    }
  }
  console.timeEnd('markdownToJson')

  console.log('====================================');
  console.log('result', result);
  console.log('====================================');

  return result;
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
