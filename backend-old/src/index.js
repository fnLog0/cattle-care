import { ApolloServer } from 'apollo-server';
import { typeDefs, resolvers } from './utils/graphql';
import connectDatabase from './utils/mongoose';
import config from './utils/config';
import { isAuthenticated } from './utils/auth';

connectDatabase(config.get('mongodb'));
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await isAuthenticated(req),
  }),
  introspection: true,
  playground: true,
});

// The `listen` method launches a web server.
server.listen(process.env.PORT || 5000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
