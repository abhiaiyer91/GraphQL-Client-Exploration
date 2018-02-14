import React from "react";
import { GraphQLClient } from "graphql-request";
import { helloWorldQuery } from "../queries";

export default class GraphQLRequest extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.client = new GraphQLClient("/graphql");
  }

  componentDidMount() {
    this.client.request(helloWorldQuery).then(data => {
      this.setState(data);
    });
  }

  render() {
    const { helloWorld } = this.state;
    return <div>{helloWorld} from GraphQL Request</div>;
  }
}
