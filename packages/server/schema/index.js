import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import resolvers from '../resolvers';
import typeDefs from './typeDefinitions';

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
