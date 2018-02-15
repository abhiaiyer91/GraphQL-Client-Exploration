import React from "react";
import { Client, query } from "micro-graphql-react";
import { helloWorldQuery } from "../queries";

const client = new Client({
  endpoint: "/graphql"
});

class MicroGraphQL extends React.Component {
  render() {
    const { loading, data } = this.props;

    if (loading) {
      return <p> Loading your MicroGraphQL data...</p>;
    }

    return <p>{data && data.helloWorld} from Micro GraphQL React</p>;
  }
}

export default query(client, props => ({
  query: helloWorldQuery
}))(MicroGraphQL);
