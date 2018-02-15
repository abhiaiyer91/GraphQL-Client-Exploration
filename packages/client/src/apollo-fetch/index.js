import React from "react";
import { createApolloFetch } from "apollo-fetch";
import { helloWorldQuery } from "../queries";

export default class ApolloFetch extends React.Component {
  constructor() {
    super();

    this.state = {};

    const uri = "/graphql";
    this.client = createApolloFetch({ uri });
  }

  componentDidMount() {
    this.client({ query: helloWorldQuery }).then(result => {
      this.setState(result.data);
    });
  }

  render() {
    const { helloWorld } = this.state;
    return <p>{helloWorld} from Apollo Fetch</p>;
  }
}
