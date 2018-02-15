import React from "react";
import FetchQL from "fetchql";

import { helloWorldQuery } from "../queries";

export default class FetchQlComponent extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.client = new FetchQL({ url: "/graphql" });
  }

  componentDidMount() {
    this.client.query({ operationName: 'hello', query: helloWorldQuery }).then(result => {
      this.setState(result.data);
    });
  }

  render() {
    const { helloWorld } = this.state;
    return <p>{helloWorld} from FetchQL</p>;
  }
}
