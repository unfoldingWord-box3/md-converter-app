import parseNumber from './parseNumber';
import populateHeaders from './populateHeaders';

export default function populateExtraSourceNotes({
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
