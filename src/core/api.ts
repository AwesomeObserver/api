import { getFolderData } from './utils';

const apiDir = __dirname + '/../app/api/';

export function setupAPI(Global) {

  const APIData = getFolderData(apiDir);
  const API = {};
  
  for (const APIName of Object.keys(APIData)) {
    API[APIName] = new APIData[APIName].default(Global);
  }

  return API;
}