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
  // Extracted and used as function multiple times so that the field goes after bible reference field.
  const addIncludedField = () => {
    if (!noIncludedField) {
      resultItem.Included = Included
    }
  }

  if (item && referenceHeader && item?.Question && item?.Response) {
    resultItem.Reference = referenceHeader?.trim()
    addIncludedField()
    resultItem.Question = heading?.trim()
    resultItem.Response = raw?.trim()
  } else if (item && item?.Reference && item?.Note && item?.Quote) {
    resultItem.Reference = referenceHeader?.trim()
    addIncludedField()
    resultItem.Note = raw
  } else if (item && item?.Reference && item?.Annotation) {
    resultItem.Reference = referenceHeader?.trim()
    addIncludedField()
    resultItem.Annotation = raw?.trim()
  } else {
    resultItem.Chapter = parseNumber(sourceChapter)
    resultItem.Verse = parseNumber(sourceVerse)
    addIncludedField()
    resultItem.GLQuote = heading?.trim()
    resultItem.OccurrenceNote = raw?.trim()
  }

  return resultItem
}
