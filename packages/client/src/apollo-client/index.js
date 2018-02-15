import React from "react";
import ApolloClient, { gql } from "apollo-boost";
import { Query, ApolloProvider } from "react-apollo";
import { helloWorldQuery } from "../queries";

const query = gql(helloWorldQuery);

const App = () => (
  <Query query={query}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading data from Apollo Client...</p>;

      return <p>{data && data.helloWorld} from Apollo Client</p>;
    }}
  </Query>
);

// Pass your GraphQL endpoint to uri
const client = new ApolloClient({ uri: "/graphql" });

export default function Root() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}
