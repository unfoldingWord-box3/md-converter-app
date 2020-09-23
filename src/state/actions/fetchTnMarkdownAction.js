import { customAlphabet } from 'nanoid/non-secure'
import * as cacheLibrary from 'money-clip';
import mdToJson from '../../helpers/md2json';
import base64DecodeUnicode from '../../helpers/base64DecodeUnicode';

function prependZero(number) {
  if (typeof number === 'number' && number <= 9)
      return "0" + number;
  else
      return number;
}

export default async function fetchTnMarkdownAction(bookUrl, bookId, reducerName, sourceNotes, setLoadingMessage) {
  const result = [];

  try {
    console.info('fetchTnMarkdownAction()');
    const nanoid = customAlphabet('1234567890abcdef', 4);
    const data = await fetch(bookUrl + '?recursive=1');
    const bookData = await data.json();
    const targetItems = {};
    const items = bookData.tree.filter(item => item.type === 'blob');

    for (let j = 0; j < items.length; j++) {
      const { path, url } = items[j];
      const key = path.split('.').slice(0, -1).join('.');
      const data = await fetch(url);
      const itemData = await data.json();
      const { content } = itemData;
      const markdown = base64DecodeUnicode(content);
      const tnJson = convertMarkdownToJson(markdown);
      targetItems[key] = tnJson;
    }

    console.log('targetItems', targetItems);
    for (let index = 0; index < sourceNotes.length; index++) {
      const sourceItem = sourceNotes[index];
      const sourceChapter = parseNumber(sourceItem.Chapter);
      const sourceVerse = parseNumber(sourceItem.Verse);
      setLoadingMessage(`${sourceChapter}/${sourceVerse}`)
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

    return result;
  } catch (error) {
    console.error(error);
    return result;
  }
}

export async function fetchTnMarkdownAction3(bookUrl, bookId, reducerName, sourceNotes, setLoadingMessage) {
  console.info('fetchTnMarkdownAction()');
  let tsvItems = [];
  const newTsvItems = [];
  const nanoid = customAlphabet('1234567890abcdef', 4)

  try {
    if (navigator.onLine) {
      const data = await fetch(bookUrl + '?recursive=1');
      const bookData = await data.json();
      console.log('bookData.tree', bookData.tree);

      const _items = bookData.tree
        // Move 'front' to the front of array
        .sort(({ path: path1 }, { path: path2 }) => { return path1 === 'front/intro.md' ? -1 : path2 === 'front/intro.md' ? 1 : 0; })
        .filter(item => item.type === 'blob');

      for (let j = 0; j < _items.length; j++) {
        const item = _items[j];
        const { path, url } = item;
        setLoadingMessage(`${path}`)
        const data = await fetch(url);
        const itemData = await data.json();
        const { content } = itemData;
        const markdown = base64DecodeUnicode(content);
        const tnJson = convertMarkdownToJson(markdown);
        const tnItemKeys = Object.keys(tnJson);
        const itemPath = path.split('.').slice(0, -1).join('.')
        const reference = itemPath.split('/');
        const chapterNumber = reference[0];
        const verseNumber = reference[1];

        for (let k = 0; k < tnItemKeys.length; k++) {
          const key = tnItemKeys[k];
          const { heading, raw } = tnJson[key];
          tsvItems.push({
            Book: bookId,
            Chapter: parseNumber(chapterNumber),
            Verse: parseNumber(verseNumber),
            id: nanoid(),
            GLQuote: heading,
            OccurrenceNote: raw,
          })
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

    for (let index = 0; index < sourceNotes.length; index++) {
      const sourceItem = sourceNotes[index];
      const sourceChapter = sourceItem.Chapter.toString();
      const sourceVerse = sourceItem.Verse.toString();
      const targetItem = tsvItems[index]
      const targetChapter = targetItem?.Chapter.toString();
      const targetVerse = targetItem?.Verse.toString();

      // if (targetChapter === '1' && targetVerse === '10') {
      //   console.log('sourceChapter', sourceChapter);
      //   console.log('sourceVerse', sourceVerse);
      // }
      if (targetChapter === sourceChapter && targetVerse === sourceVerse) {
        // if (targetChapter === '1' && targetVerse === '10') {
        //   console.log('1');
        // }
        newTsvItems.push(targetItem);
      } else if (unusedTargetItems[0] && unusedTargetItems[0].Chapter.toString() === sourceChapter && unusedTargetItems[0].Verse.toString() === sourceVerse) {
        // if (targetChapter === '1' && targetVerse === '10') {
        //   console.log('2');
        //   console.log('unusedTargetItems', unusedTargetItems);
        // }
        const result = unusedTargetItems[0];
        unusedTargetItems.shift();
        newTsvItems.push(result);
      } else {
        // if (targetChapter === '1' && targetVerse === '10') {
        //   console.log('3');
        // }
        if (sourceChapter === '1' && sourceVerse === '10') {
          console.log('3');
          console.log('unusedTargetItems', unusedTargetItems);
        }
        unusedTargetItems.push(targetItem);
        newTsvItems.push({
          Book: bookId,
          Chapter: parseNumber(sourceChapter),
          Verse: parseNumber(sourceVerse),
          id: nanoid(),
          GLQuote: '',
          OccurrenceNote: '',
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  return newTsvItems;
}

export async function fetchTnMarkdownAction2(bookUrl, bookId, reducerName, sourceNotes, setLoadingMessage) {
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
          setLoadingMessage(`${bookId} ${chapterNumber}:${verseNumber}`)
          const data = await fetch(verseUrl);
          const verseData = await data.json();
          const { content } = verseData;
          const markdown = base64DecodeUnicode(content);
          const tnJson = convertMarkdownToJson(markdown)
          const tnItemKeys = Object.keys(tnJson);

          if (chapterNumber === 1 && verseNumber === 10) {
            console.log('tnJson', tnJson);
          }

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
      const data = await cacheLibrary.getAll().then(
        cacheData => {
          return cacheData[reducerName]?.glTsvs?.en || {}
        }
      );

      return data;
    }
    const unusedTargetItems = [];

    tsvItems = sourceNotes.map((sourceItem, index) => {
      const sourceChapter = sourceItem.Chapter.toString();
      const sourceVerse = sourceItem.Verse.toString();
      const targetItem = tsvItems[index]
      const targetChapter = targetItem?.Chapter.toString();
      const targetVerse = targetItem?.Verse.toString();

      // if (targetChapter === '1' && targetVerse === '10') {
      //   console.log('sourceChapter', sourceChapter);
      //   console.log('sourceVerse', sourceVerse);
      // }
      if (targetChapter === sourceChapter && targetVerse === sourceVerse) {
        // if (targetChapter === '1' && targetVerse === '10') {
        //   console.log('1');
        // }
        return targetItem;
      } else if (unusedTargetItems[0] && unusedTargetItems[0].Chapter.toString() === sourceChapter && unusedTargetItems[0].Verse.toString() === sourceVerse) {
        // if (targetChapter === '1' && targetVerse === '10') {
        //   console.log('2');
        //   console.log('unusedTargetItems', unusedTargetItems);
        // }
        const result = unusedTargetItems[0];
        unusedTargetItems.shift();
        return result;
      } else {
        // if (targetChapter === '1' && targetVerse === '10') {
        //   console.log('3');
        // }
        if (sourceChapter === '1' && sourceVerse === '10') {
          console.log('3');
          console.log('unusedTargetItems', unusedTargetItems);
        }
        unusedTargetItems.push(targetItem);
        return {
          Book: bookId,
          Chapter: parseNumber(sourceChapter),
          Verse: parseNumber(sourceVerse),
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
  if (typeof number === 'string') {
    if (number.includes('.')) number = number.split('.').slice(0, -1).join('.')
  }

  const result = typeof number === 'number' || !isNaN(parseInt(number)) ?
    parseInt(number) : number;
  return result;
}


function convertMarkdownToJson(markdown) {
  const tnJson = {};
  let json = {};

  try {
    json = mdToJson.parse(markdown);
  } catch (error) {
    json = { '': { raw: markdown } }
  }

  for (let i = 0; i < Object.keys(json).length; i++) {
    const heading = Object.keys(json)[i];
    const { occurrence, raw } = json[heading];
    tnJson[occurrence || 1] = {
      heading,
      raw
    }
  }

  return tnJson;
}
