import parseNumber from './parseNumber';

export default function populateHeaders({
  raw,
  item,
  bookId,
  nanoid,
  heading,
  sourceVerse,
  sourceChapter,
  Included = true,
  noIncludedField = false,
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

  if (!noIncludedField) {
    resultItem.Included = Included
  }

  return resultItem
}
