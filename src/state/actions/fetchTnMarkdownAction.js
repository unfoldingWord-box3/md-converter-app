import { customAlphabet } from 'nanoid/non-secure'
import mdToJson from '../../helpers/md2json';
import base64DecodeUnicode from '../../helpers/base64DecodeUnicode';

export default async function fetchTnMarkdownAction(bookUrl, bookId, sourceNotes, setLoadingMessage) {
  const result = [];
  const extraSourceNotes = [];

  try {
    if (navigator.onLine) {
      const nanoid = customAlphabet('1234567890abcdef', 4);
      const data = await fetch(bookUrl + '?recursive=1');
      const bookData = await data.json();
      const targetItems = {};
      const items = bookData.tree.filter(item => item.type === 'blob');

      // TODO: Debug perf in loop below
      for (let j = 0; j < items.length; j++) {
        const { path, url } = items[j];
        const key = path.split('.').slice(0, -1).join('.');
        setLoadingMessage(`${bookId.toUpperCase()} ${key}`);
        const data = await fetch(url);
        const itemData = await data.json();
        const { content } = itemData;
        const markdown = base64DecodeUnicode(content);
        const tnJson = convertMarkdownToJson(markdown);
        targetItems[key] = tnJson;
      }

      setLoadingMessage(bookId);
      for (let index = 0; index < sourceNotes.length; index++) {
        const sourceItem = sourceNotes[index];
        const previousSourceItem = sourceNotes[index - 1];
        const bibleBeferenceArray = getchapterVerseFromReference(sourceItem)
        const sourceChapter = parseNumber(sourceItem.Chapter || bibleBeferenceArray[0]);
        const sourceVerse = parseNumber(sourceItem.Verse || bibleBeferenceArray[1]);
        const previousBibleBeference = getchapterVerseFromReference(previousSourceItem)
        const previousSourceChapter = previousSourceItem ? parseNumber(previousSourceItem.Chapter || previousBibleBeference[0]) : null;
        const previousSourceVerse = previousSourceItem ? parseNumber(previousSourceItem.Verse || previousBibleBeference[1]) : null;
        const previousReference = getReference(previousSourceChapter, previousSourceVerse);
        const reference = getReference(sourceChapter, sourceVerse);
        const previousNoteJson = targetItems[previousReference];
        const noteJson = targetItems[reference];


        if (previousSourceVerse && previousNoteJson && Object.keys(previousNoteJson).length && sourceVerse > previousSourceVerse) {
          populateExtraSourceNotes({
            index,
            bookId,
            result,
            nanoid,
            extraSourceNotes,
            previousSourceItem,
            json: previousNoteJson,
            verse: previousSourceVerse,
            chapter: previousSourceChapter,
          });

          const keys = Object.keys(previousNoteJson);
          const key = keys[0];

          delete previousNoteJson[key];
        } else if (previousSourceVerse && ((previousSourceVerse + 2) === sourceVerse || (previousSourceVerse + 3) === sourceVerse || (previousSourceChapter < sourceChapter && sourceVerse === 'intro' && targetItems[getReference(previousSourceChapter, previousSourceVerse+1)]))) {
          const missingVerse = previousSourceVerse + 1;

          if ((sourceVerse - 3) === previousSourceVerse) {
            const missingVerses = [missingVerse, missingVerse + 1];

            missingVerses.forEach((verse) => {
              const json = targetItems[getReference(previousSourceChapter, verse)]

              if (json) {
                populateExtraSourceNotes({
                  json,
                  index,
                  verse,
                  bookId,
                  result,
                  nanoid,
                  extraSourceNotes,
                  previousSourceItem,
                  chapter: previousSourceChapter,
                });
              }
            })
          } else {
            const json = targetItems[getReference(previousSourceChapter, missingVerse)]

            if (json) {
              populateExtraSourceNotes({
                json,
                index,
                bookId,
                result,
                nanoid,
                extraSourceNotes,
                previousSourceItem,
                verse: missingVerse,
                chapter: previousSourceChapter,
              });
            }
          }
        }

        if (noteJson) {
          const keys = Object.keys(noteJson);

          if (keys.length) {
            const firstKey = keys[0];
            const { heading, raw } = noteJson[firstKey];

            const resultItem = populateHeaders({
              raw,
              bookId,
              nanoid,
              heading,
              sourceVerse,
              sourceChapter,
              item: sourceItem,
            })

            result.push(resultItem)

            delete noteJson[firstKey];
          } else {
            const resultItem = populateHeaders({
              bookId,
              nanoid,
              raw: '',
              heading: '',
              sourceVerse,
              sourceChapter,
              item: sourceItem,
            })

            result.push(resultItem)
          }
        } else {
          const resultItem = populateHeaders({
            bookId,
            nanoid,
            raw: '',
            heading: '',
            sourceVerse,
            sourceChapter,
            item: sourceItem,
          })

          result.push(resultItem)
        }
      }
    } else {
      return result;
    }

    if (extraSourceNotes.length) {
      for (let i = 0; i < extraSourceNotes.length; i++) {
        const { index, emptySourceNote } = extraSourceNotes[i]
        sourceNotes.splice(index, 0, emptySourceNote)
      }
    }

    return result;
  } catch (error) {
    console.error(error);
    return result;
  }
}

function getReference(chapter, verse) {
  return `${prependZero(chapter)}/${prependZero(verse)}`;
}

function populateExtraSourceNotes({
  json,
  index,
  verse,
  bookId,
  result,
  nanoid,
  chapter,
  extraSourceNotes,
  previousSourceItem,
}) {
  const keys = Object.keys(json);
  const key = keys[0];
  const { heading, raw } = json[key];

  const resultItem = populateHeaders({
    raw,
    bookId,
    nanoid,
    heading,
    item: previousSourceItem,
    sourceVerse: parseNumber(verse),
    sourceChapter: parseNumber(chapter),
  })

  result.push(resultItem)

  const emptySourceNote = populateHeaders({
    bookId,
    nanoid,
    raw: '',
    heading: '',
    item: previousSourceItem,
    sourceVerse: parseNumber(verse),
    sourceChapter: parseNumber(chapter),
  })

  const extraIndexNumber = extraSourceNotes.length >= 0 ? extraSourceNotes.length : 1;

  extraSourceNotes.push({
    emptySourceNote,
    index: index + extraIndexNumber,
  })
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

/**
 * Returns an array of the reference first value being the chapter and the second value being the verse
 * @param {object} item
 * @returns {array|null} bible reference array
 */
function getchapterVerseFromReference(item) {
  return item && item?.Chapter ? null : item?.Reference.split(':')
}

function populateHeaders({
  raw,
  item,
  bookId,
  nanoid,
  heading,
  sourceVerse,
  sourceChapter,
}) {
  const referenceHeader = item?.Reference
  const resultItem = {
    Book: bookId,
    id: nanoid(),
  }

  if (item && referenceHeader && item?.Question && item?.Response) {
    resultItem.Reference = referenceHeader.trim()
    resultItem.Question = heading.trim()
    resultItem.Response = raw.trim()
  } else if (item && item?.Reference && item?.Note && item?.Quote) {
    resultItem.Reference = referenceHeader.trim()
    resultItem.Note = raw
  } else if (item && item?.Reference && item?.Annotation) {
    resultItem.Reference = referenceHeader.trim()
    resultItem.Annotation = raw.trim()
  } else {
    resultItem.Chapter = parseNumber(sourceChapter)
    resultItem.Verse = parseNumber(sourceVerse)
    resultItem.GLQuote = heading.trim()
    resultItem.OccurrenceNote = raw.trim()
  }

  return resultItem
}
