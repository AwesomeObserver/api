import { makeExecutableSchema } from 'graphql-tools';
import { getFolderData } from './utils';

const gqlDir = __dirname + '/../app/';
const typeDefs = [];
const resolvers = {};

const typesData = getFolderData(`${gqlDir}types/`);
Object.keys(typesData).forEach(name => typeDefs.push(typesData[name].type));

function makeSType(tname, path) {
  const data = getFolderData(path);
  const tschema = [];
  const tresolvers = {};

  Object.keys(data).forEach(name => {
    tschema.push(data[name].schema);
    tresolvers[name] = data[name].resolver;
  });

  if (tschema.length > 0) {
    typeDefs.push(`type ${tname} { ${tschema.join(' ')} }`);
    resolvers[tname] = tresolvers;
  }
}

makeSType('Query', `${gqlDir}queries/`);
makeSType('Mutation', `${gqlDir}mutations/`);

const isQueries = Object.keys(resolvers['Query']).length > 0;
const isMutations = Object.keys(resolvers['Mutation']).length > 0;

if (!isQueries && !isMutations) {
  throw new Error('Must be queries or mutations in schema');
}

typeDefs.push(`
  schema {
    ${isQueries ? 'query: Query' : ''}
    ${isMutations ? 'mutation: Mutation': ''}
  }
`);

export const schema = makeExecutableSchema({ typeDefs, resolvers });