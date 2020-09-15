import base64DecodeUnicode from './base64DecodeUnicode';
import tsvToJson from './tsvToJson';
import fetchContent from './fetchContent';

export default async function getGlTsvContent(enTsvUrl) {
  const content = await fetchContent(enTsvUrl);
  const tsv = base64DecodeUnicode(content);

  return tsvToJson(tsv)
}
