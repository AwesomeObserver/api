import { getFolderData } from './utils';

export async function getEntites() {
  const data = getFolderData(__dirname + '/../app/entity/');

  let entites = {};

  const values = Object.values(data);

  for (const entityDataObj of values) {
    for (const entityName of Object.keys(entityDataObj)) {
      entites[entityName] = entityDataObj[entityName]
    }
  }

  return entites;
}