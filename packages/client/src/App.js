import React from 'react';
import GraphQLRequest from './graphql-request';
import URQL from './urql';
import MicroGraphQL from './micro-graphql-react';
import RelayModern from './relay-modern';
import ApolloClient from './apollo-client';

export default function Root() {
  return (
    <section>
      <GraphQLRequest />
      <URQL />
      <MicroGraphQL />
      <RelayModern />
      <ApolloClient />
    </section>
  )
}
