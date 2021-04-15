/**
 * Returns an array of the reference first value being the chapter and the second value being the verse
 * @param {object} item
 * @returns {array|null} bible reference array
 */
export default function getchapterVerseFromReference(item) {
  return item && item?.Chapter ? null : item?.Reference.split(':')
}
