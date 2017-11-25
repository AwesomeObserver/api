import { getFolderData } from './utils';

const apiDir = __dirname + '/../api/';

export function setupAPI(Global) {

  const APIData = getFolderData(apiDir);
  const API = {};
  
  for (const APIName of Object.keys(APIData)) {
    // console.log(APIName, APIData[APIName].default);
    API[APIName] = new APIData[APIName].default(Global);
  }

  return API;
}