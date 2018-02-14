import React from "react";
import { Provider, Client, query, Connect } from "urql";
import { helloWorldQuery } from "../queries";

const client = new Client({
  url: "/graphql"
});

function UrqlComp() {
  return (
    <Connect query={query(helloWorldQuery)}>
      {({ loaded, refetch, data }) => {
        if (!loaded) {
          return <p> Loading your URQL data...</p>;
        }

        return <p>{data && data.helloWorld} from URQL</p>;
      }}
    </Connect>
  );
}

export default function Root() {
  return (
    <Provider client={client}>
      <UrqlComp />
    </Provider>
  );
}
