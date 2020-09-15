import YAML from 'yamljs';
import fetchContent from './fetchContent';
import base64DecodeUnicode from './base64DecodeUnicode';

export default async function getManifest(url) {
  const content = await fetchContent(url);
  const yamlString = base64DecodeUnicode(content)

  return YAML.parse(yamlString);
}
