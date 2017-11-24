import * as fs from 'fs';
import * as path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import pubsub from './pubsub';

const typeDefs = [];
const queriesResolvers = {};
const mutationsResolvers = {};
const subscriptionsResolvers = {};

function getFolderData(folderPath) {
  const files = fs.readdirSync(folderPath, 'utf-8');
  let data = {};
  
  files.forEach(fileName => {
    const fullFileName = `${folderPath}${fileName}`;
    const { ext, name } = path.parse(fullFileName);
    
    if (ext === '.ts' || ext === '.js') {
      data[name] = require(fullFileName);
    } else if (ext === '') {
      const folderData = getFolderData(`${folderPath}${name}/`);
      data = { ...data, ...folderData };
    }
  });

  return data;
}

const gqlDir = __dirname + '/../gql/';

// Types
(() => {
  const data = getFolderData(`${gqlDir}types/`);

  for (const name of Object.keys(data)) {
    typeDefs.push(data[name].type);
  }

})();

// Queries
(() => {
  const data = getFolderData(`${gqlDir}queries/`);
  const schema = [];

  for (const name of Object.keys(data)) {
    schema.push(data[name].schema);
    queriesResolvers[name] = data[name].resolver;
  }

  typeDefs.push(`type Query { ${schema.join(' ')} }`);
})();

// Mutations
(() => {
  const data = getFolderData(`${gqlDir}mutations/`);
  const schema = [];

  for (const name of Object.keys(data)) {
    schema.push(data[name].schema);
    mutationsResolvers[name] = data[name].resolver;
  }
  
  typeDefs.push(`type Mutation { ${schema.join(' ')} }`);
})();

// Subscriptions
(() => {
  const data = getFolderData(`${gqlDir}subscriptions/`);
  const schema = [];

  for (const name of Object.keys(data)) {
    schema.push(data[name].schema);
    subscriptionsResolvers[name] = data[name].resolver;
  }

  typeDefs.push(`type Subscription { ${schema.join(' ')} }`);
})();


typeDefs.push(`
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`);

const resolvers = {
  Query: queriesResolvers,
  Mutation: mutationsResolvers,
  Subscription: subscriptionsResolvers
};

export default makeExecutableSchema({ typeDefs, resolvers });