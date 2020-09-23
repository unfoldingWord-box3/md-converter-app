
export default function base64DecodeUnicode(str) {
  // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
  const shunks = atob(str).split('')
  const percentEncodedStrs = [];

  for (let i = 0; i < shunks.length; i++) {
    const c = shunks[i];
    percentEncodedStrs.push('%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2));
  }

  const percentEncodedStr = percentEncodedStrs.join('');

  return decodeURIComponent(percentEncodedStr);
}
