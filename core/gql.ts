import { getFolderData } from './utils';
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = [];
let isQueries = false;
let isMutations = false;
const queriesResolvers = {};
const mutationsResolvers = {};

const gqlDir = __dirname + '/../app/';

// Types
{
  const data = getFolderData(`${gqlDir}types/`);

  for (const name of Object.keys(data)) {
    typeDefs.push(data[name].type);
  }

}

// Queries
{
  const data = getFolderData(`${gqlDir}queries/`);
  const schema = [];

  for (const name of Object.keys(data)) {
    schema.push(data[name].schema);
    queriesResolvers[name] = data[name].resolver;
  }

  if (schema.length > 0) {
    isQueries = true;
    typeDefs.push(`type Query { ${schema.join(' ')} }`);
  }
}

// Mutations
{
  const data = getFolderData(`${gqlDir}mutations/`);
  const schema = [];

  for (const name of Object.keys(data)) {
    schema.push(data[name].schema);
    mutationsResolvers[name] = data[name].resolver;
  }

  if (schema.length > 0) {
    isMutations = true;
    typeDefs.push(`type Mutation { ${schema.join(' ')} }`);
  }
}

if (!isQueries && !isMutations) {
  throw new Error('Must be queries or mutations in schema');
}

typeDefs.push(`
  schema {
    ${isQueries ? 'query: Query' : ''}
    ${isMutations ? 'mutation: Mutation': ''}
  }
`);

let resolvers = {};

if (isQueries) {
  resolvers['Query'] = queriesResolvers;
}

if (isMutations) {
  resolvers['Mutation'] = mutationsResolvers;
}

export const schema = makeExecutableSchema({ typeDefs, resolvers });