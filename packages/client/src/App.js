import React from "react";
import ApolloFetch from "./apollo-fetch";
import Lokka from "./lokka";
import FetchQL from "./fetchql";
import GraphQLRequest from "./graphql-request";
import URQL from "./urql";
import MicroGraphQL from "./micro-graphql-react";
import RelayModern from "./relay-modern";
import ApolloClient from "./apollo-client";

export default function Root() {
  return (
    <section>
      <ApolloFetch />
      <Lokka />
      <FetchQL />
      <GraphQLRequest />
      <MicroGraphQL />
      <URQL />
      <ApolloClient />
      <RelayModern />
    </section>
  );
}
