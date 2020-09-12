import { customAlphabet } from 'nanoid/non-secure'
import * as cacheLibrary from 'money-clip';
import mdToJson from '../../helpers/md2json';

export default async function fetchTnMarkdownAction(bookUrl, bookId, reducerName, sourceNotes) {
  console.info('fetchTnMarkdownAction()');
  let tsvItems = [];
  const nanoid = customAlphabet('1234567890abcdef', 4)

  try {
    if (navigator.onLine) {
      const data = await fetch(bookUrl);
      const bookData = await data.json();
      const chapters = bookData.tree
        // Move 'front' to the front of array
        .sort(({ path: path1 }, { path: path2 }) => { return path1 === 'front' ? -1 : path2 === 'front' ? 1 : 0; });

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        let { path: chapterNumber, url: chapterUrl } = chapter;
        chapterNumber = parseNumber(chapterNumber);
        const data = await fetch(chapterUrl);
        const chapterData = await data.json();
        const verses = chapterData.tree
          // Move 'intro.md' to the front of array
          .sort(({ path: path1 }, { path: path2 }) => { return path1 === 'intro.md' ? -1 : path2 === 'intro.md' ? 1 : 0; });

        for (let j = 0; j < verses.length; j++) {
          const verse = verses[j];
          let { path: verseNumber, url: verseUrl } = verse;
          verseNumber = parseNumber(verseNumber);
          const data = await fetch(verseUrl);
          const verseData = await data.json();
          const { content } = verseData;
          const markdown = base64DecodeUnicode(content);
          const tnJson = convertMarkdownToJson(markdown)
          const tnItemKeys = Object.keys(tnJson);

          for (let k = 0; k < tnItemKeys.length; k++) {
            const key = tnItemKeys[k];
            const { heading, raw } = tnJson[key];
            tsvItems.push({
              Book: bookId,
              Chapter: chapterNumber,
              Verse: verseNumber,
              id: nanoid(),
              GLQuote: heading,
              OccurrenceNote: raw,
            })
          }
        }
      }
    } else {
      cacheLibrary.getAll().then(
        cacheData => {
          return cacheData[reducerName]?.glTsvs?.en || {}
        }
      );
    }
    const unusedTargetItems = [];

    tsvItems = sourceNotes.map((sourceItem, index) => {
      const sourceChapter = sourceItem.Chapter.toString();
      const sourceVerse = sourceItem.Verse.toString();
      const targetItem = tsvItems[index]
      const targetChapter = targetItem?.Chapter.toString();
      const targetVerse = targetItem?.Verse.toString();

      if (targetChapter === sourceChapter && targetVerse === sourceVerse) {
        return targetItem;
      } else if (unusedTargetItems[0] && unusedTargetItems[0].Chapter.toString() === sourceChapter && unusedTargetItems[0].Verse.toString() === sourceVerse) {
        const result = unusedTargetItems[0];
        unusedTargetItems.shift();
        return result;
      } else {
        unusedTargetItems.push(targetItem);
        return {
          Book: '',
          Chapter: sourceChapter,
          Verse: sourceVerse,
          id: nanoid(),
          GLQuote: '',
          OccurrenceNote: '',
        }
      }
    })
  } catch (error) {
    console.error(error);
  }

  return tsvItems;
}

function parseNumber(number) {
  if (number.includes('.')) number = number.split('.').slice(0, -1).join('.')
  const result = typeof number === 'number' || !isNaN(parseInt(number)) ?
    parseInt(number) : number;
  return result;
}

export function base64DecodeUnicode(str) {
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
