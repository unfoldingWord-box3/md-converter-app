import { customAlphabet } from 'nanoid/non-secure'
import * as cacheLibrary from 'money-clip';
import mdToJson from '../../helpers/md2json';
import base64DecodeUnicode from '../../helpers/base64DecodeUnicode';

export default async function fetchTnMarkdownAction(bookUrl, bookId, reducerName, sourceNotes, setLoadingMessage) {
  const result = [];

  try {
    if (navigator.onLine) {
      console.info('fetchTnMarkdownAction()');
      const nanoid = customAlphabet('1234567890abcdef', 4);
      const data = await fetch(bookUrl + '?recursive=1');
      const bookData = await data.json();
      const targetItems = {};
      const items = bookData.tree.filter(item => item.type === 'blob');

      // TODO: Debug perf in loop below
      for (let j = 0; j < items.length; j++) {
        const { path, url } = items[j];
        const key = path.split('.').slice(0, -1).join('.');
        setLoadingMessage(key);
        const data = await fetch(url);
        const itemData = await data.json();
        const { content } = itemData;
        const markdown = base64DecodeUnicode(content);
        const tnJson = convertMarkdownToJson(markdown);
        targetItems[key] = tnJson;
      }

      for (let index = 0; index < sourceNotes.length; index++) {
        const sourceItem = sourceNotes[index];
        const sourceChapter = parseNumber(sourceItem.Chapter);
        const sourceVerse = parseNumber(sourceItem.Verse);
        const reference = `${prependZero(sourceChapter)}/${prependZero(sourceVerse)}`
        const noteJson = targetItems[reference];

        if (noteJson) {
          const keys = Object.keys(noteJson);

          if (keys.length) {
            const firstKey = keys[0];
            const { heading, raw } = noteJson[firstKey];

            result.push({
              Book: bookId,
              Chapter: parseNumber(sourceChapter),
              Verse: parseNumber(sourceVerse),
              id: nanoid(),
              GLQuote: heading,
              OccurrenceNote: raw,
            })

            delete noteJson[firstKey];
          } else {
            result.push({
              Book: bookId,
              Chapter: parseNumber(sourceChapter),
              Verse: parseNumber(sourceVerse),
              id: nanoid(),
              GLQuote: '',
              OccurrenceNote: '',
            })
          }
        } else {
          result.push({
            Book: bookId,
            Chapter: parseNumber(sourceChapter),
            Verse: parseNumber(sourceVerse),
            id: nanoid(),
            GLQuote: '',
            OccurrenceNote: '',
          })
        }
      }
    } else {
      const data = await cacheLibrary.getAll().then(
        cacheData => {
          return cacheData[reducerName]?.glTsvs?.en || {}
        }
      );

      return data;
    }

    return result;
  } catch (error) {
    console.error(error);
    return result;
  }
}

function prependZero(number) {
  if (typeof number === 'number' && number <= 9)
    return "0" + number;
  else
    return number;
}

function parseNumber(number) {
  if (typeof number === 'string') {
    if (number.includes('.')) number = number.split('.').slice(0, -1).join('.')
  }

  const result = typeof number === 'number' || !isNaN(parseInt(number)) ?
    parseInt(number) : number;
  return result;
}


function convertMarkdownToJson(markdown) {
  let json = {};

  try {
    json = mdToJson.parse(markdown);
  } catch (error) {
    json = { '': { raw: markdown } }
  }

  return json;
}
