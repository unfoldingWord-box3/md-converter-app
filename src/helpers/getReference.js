function prependZero(number) {
  if (typeof number === 'number' && number <= 9)
    return "0" + number;
  else
    return number;
}

export default function getReference(chapter, verse) {
  return `${prependZero(chapter)}/${prependZero(verse)}`;
}
