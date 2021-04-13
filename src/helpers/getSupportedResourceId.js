/**
 * Gets the Supported ResourceId if found otherwise returns null
 * @param {object} sourceRepository
 * @returns 'tq', 'tn' or null
 */
export default function getSupportedResourceId(sourceRepository) {
  // const tqLabels = ['Translation Questions', 'translationQuestions', 'tQuestions', 'TranslationQuestions']
  const tnLabels = ['Translation Notes', 'translationNotes', 'tNotes', 'TranslationNotes']
  const isTnOrTq = (str) =>
    // tqLabels.find(element => str.includes(element)) ? 'tq' : // TODO: Temporary disabled tQ
    tnLabels.find(element => str.includes(element)) ? 'tn' : null

  if (sourceRepository?.subject) {
    const subject = sourceRepository?.subject
    return isTnOrTq(subject)
  } else if (sourceRepository?.parent?.subject) {
    const subject = sourceRepository?.parent?.subject
    return isTnOrTq(subject)
  } else if (sourceRepository?.description) {
    const description = sourceRepository?.description
    return isTnOrTq(description)
  } else {
    return null
  }
}
