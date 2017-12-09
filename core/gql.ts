import { getFolderData } from './utils';
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = [];
let isQueries = false;
let isMutations = false;
let isSubscriptions = false;
const queriesResolvers = {};
const mutationsResolvers = {};
const subscriptionsResolvers = {};

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

// Subscriptions
{
  const data = getFolderData(`${gqlDir}subscriptions/`);
  const schema = [];

  for (const name of Object.keys(data)) {
    schema.push(data[name].schema);
    subscriptionsResolvers[name] = data[name].resolver;
  }

  if (schema.length > 0) {
    isSubscriptions = true;
    typeDefs.push(`type Subscription { ${schema.join(' ')} }`);
  }
}

if (!isQueries && !isMutations) {
  throw new Error('Must be queries or mutations in schema');
}

typeDefs.push(`
  schema {
    ${isQueries ? 'query: Query' : ''}
    ${isMutations ? 'mutation: Mutation': ''}
    ${isSubscriptions ? 'subscription: Subscription' : ''}    
  }
`);

let resolvers = {};

if (isQueries) {
  resolvers['Query'] = queriesResolvers;
}

if (isMutations) {
  resolvers['Mutation'] = mutationsResolvers;
}

if (isSubscriptions) {
  resolvers['Subscription'] = subscriptionsResolvers;
}

export default makeExecutableSchema({ typeDefs, resolvers });