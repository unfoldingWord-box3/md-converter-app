import { customAlphabet } from 'nanoid/non-secure'
import mdToJson from '../../helpers/md2json';
import base64DecodeUnicode from '../../helpers/base64DecodeUnicode';

export default async function fetchTnMarkdownAction(bookUrl, bookId, sourceNotes, setLoadingMessage) {
  const result = [];
  const extraSourceNotes = [];
  const targetItems = {};
  const nanoid = customAlphabet('123456789abcdefghijklmnopqrstuvwxyz', 4);

  try {
    if (navigator.onLine) {
      const data = await fetch(bookUrl + '?recursive=1');
      const bookData = await data.json();
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

      setLoadingMessage(bookId.toUpperCase());
      for (let index = 0; index < sourceNotes.length; index++) {
        const sourceItem = sourceNotes[index];
        const previousSourceItem = sourceNotes[index - 1];
        const bibleBeferenceArray = getchapterVerseFromReference(sourceItem)
        const sourceChapter = parseNumber(sourceItem.Chapter || bibleBeferenceArray[0]);
        const sourceVerse = parseNumber(sourceItem.Verse || bibleBeferenceArray[1]);
        const previousBibleBeference = getchapterVerseFromReference(previousSourceItem)
        const previousSourceChapter = previousSourceItem || previousBibleBeference ? parseNumber(previousSourceItem.Chapter || previousBibleBeference[0]) : null;
        const previousSourceVerse = previousSourceItem || previousBibleBeference ? parseNumber(previousSourceItem.Verse || previousBibleBeference[1]) : null;
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

    const targetItemKeys = Object.keys(targetItems)

    // Still missing target rows? then ...
    for (let i = 0; i < targetItemKeys.length; i++) {
      const key = targetItemKeys[i]
      const targetItem = targetItems[key]
      const valueKeys = Object.keys(targetItem).reverse()

      if (valueKeys.length > 0) {
          const references = key.split('/')
          const chapter = parseInt(references[0])
          const verse = parseInt(references[1])
          const referenceKey = `${chapter}:${verse}`
          let addition = 0

          let index = result.findIndex(({ Reference }) => {
            const condition1 = Reference === referenceKey
            const condition2 = Reference === `${chapter}:${verse + 1}`
            const condition3 = Reference === `${chapter}:${verse + 2}`
            const condition4 = Reference === `${chapter}:${verse + 3}`

            // Based on the condition used we determined how much to add to the index where we'll add the missing item.
            if (condition1) {
              addition = 1 // +1
            } else if (condition2) {
              addition = 0 // +0
            } else if (condition3) {
              addition = 0 // +0
            } else if (condition4) {
              addition = 0 // +0
            }

            return condition1 || condition2 || condition3 || condition4
          })

          index = index + addition

          if (index) {
            for (let j = 0; j < valueKeys.length; j++) {
              const valueKey = valueKeys[j]
              const { heading, raw } = targetItem[valueKey]
              const newTargetRow = populateHeaders({
                raw,
                bookId,
                nanoid,
                heading,
                sourceVerse: verse,
                item: sourceNotes[0],
                sourceChapter: chapter,
              })
              const emptySourceNote = populateHeaders({
                bookId,
                nanoid,
                raw: '',
                heading: '',
                sourceVerse: verse,
                item: sourceNotes[0],
                sourceChapter: chapter,
              })

              result.splice(index, 0, newTargetRow)
              sourceNotes.splice(index, 0, emptySourceNote)
            }
          }
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

  for (let j = 0; j < keys.length; j++) {
    const key = keys[j];
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

    delete json[key];
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
  const referenceHeader = sourceChapter && sourceVerse ? `${sourceChapter}:${sourceVerse}` : item?.Reference
  const resultItem = {
    Book: bookId.toUpperCase(),
    id: nanoid(),
  }

  if (item && referenceHeader && item?.Question && item?.Response) {
    resultItem.Reference = referenceHeader?.trim()
    resultItem.Question = heading?.trim()
    resultItem.Response = raw?.trim()
  } else if (item && item?.Reference && item?.Note && item?.Quote) {
    resultItem.Reference = referenceHeader?.trim()
    resultItem.Note = raw
  } else if (item && item?.Reference && item?.Annotation) {
    resultItem.Reference = referenceHeader?.trim()
    resultItem.Annotation = raw?.trim()
  } else {
    resultItem.Chapter = parseNumber(sourceChapter)
    resultItem.Verse = parseNumber(sourceVerse)
    resultItem.GLQuote = heading?.trim()
    resultItem.OccurrenceNote = raw?.trim()
  }

  return resultItem
}
