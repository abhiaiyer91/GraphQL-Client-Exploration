import React from "react";
import { QueryRenderer, graphql } from "react-relay";
import environment from "./environment";

const query = graphql`
  query relayModernhelloQuery {
    helloWorld
  }
`;

export default function Root() {
  return (
    <QueryRenderer
      environment={environment}
      query={query}
      render={({ error, props }) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <p>{props.helloWorld} from Relay Modern</p>;
        }
        return <div>Loading your Relay Modern data...</div>;
      }}
    />
  );
}
