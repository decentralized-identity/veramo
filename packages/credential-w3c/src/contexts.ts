
import * as fs from 'fs';
import * as path from 'path';

function _read(_path: string) {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, _path),
      {encoding: 'utf8'}));
}

const contexts = new Map([
  ['https://veramo.io/contexts/socialmedia/v1', _read('./contexts/socialmedia-v1.jsonld')],
]);

export default contexts;
