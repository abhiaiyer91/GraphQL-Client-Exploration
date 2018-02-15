import React from "react";
import { Lokka } from "lokka";
import { Transport } from "lokka-transport-http";
import { helloWorldQuery } from "../queries";

export default class LokkaComponent extends React.Component {
  constructor() {
    super();

    this.state = {};

    this.client = new Lokka({
      transport: new Transport("/graphql")
    });
  }

  componentDidMount() {
    this.client.query(helloWorldQuery).then(data => {
      this.setState(data);
    });
  }

  render() {
    const { helloWorld } = this.state;
    return <p>{helloWorld} from Lokka</p>;
  }
}
