import { base64DecodeUnicode } from '../state/actions/fetchTnMarkdownAction';
import tsvToJson from './tsvToJson';

export default async function getGlTsvContent(enTsvUrl) {
  const { content } = await fetch(enTsvUrl).then(data => data.json());
  const tsv = base64DecodeUnicode(content);

  return tsvToJson(tsv)
}
