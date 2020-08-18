import axios from 'axios';
import mdToJson from 'md-2-json';

function base64DecodeUnicode(str) {
  // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
  const percentEncodedStr = atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join('');

  return decodeURIComponent(percentEncodedStr);
}

export default async function markdownToJson(bookUrl) {
  console.time('markdownToJson')
  const { data: bookData } = await axios(bookUrl);
  const chapters = bookData.tree;
  const result = {};

  for (let index = 0; index < chapters.length; index++) {
    const chapter = chapters[index];
    const { path: chapterNumber, url: chapterUrl } = chapter;
    const { data: chapterData } = await axios(chapterUrl);
    const verses = chapterData.tree;

    for (let index = 0; index < verses.length; index++) {
      const verse = verses[index];
// console.log('====================================');
// console.log('verse', verse);
// console.log('====================================');
      const { path: verseNumber, url: verseUrl } = verse;
      const { data: verseData } = await axios(verseUrl);
// console.log('====================================');
console.log('chapterNumber', chapterNumber);
console.log('verseNumber', verseNumber);
console.log('verseUrl', verseUrl);
// console.log('verseData', verseData);
// console.log('====================================');
      const { content } = verseData;
      const markdown = base64DecodeUnicode(content);
      console.log("parsed markdown", markdown);
      let json = ''

      try {
        // TODO: Parsing should keep the order of the headings somehow.
        json = mdToJson.parse(markdown)
      } catch (error) {
        json = { '': { raw: markdown } }
        console.error(error);
      }
      console.log("json", json);
      result[chapterNumber] = {
        ...result[chapterNumber],
        [verseNumber]: json
      }
    }
  }
  console.timeEnd('markdownToJson')

  console.log('====================================');
  console.log('result', result);
  console.log('====================================');
}
