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

    this.setPayload = this.setPayload.bind(this);
  }

  componentDidMount() {
    this.client.query(helloWorldQuery).then(data => {
      this.setState(data);
    });

    // watch the query
    const watchHandler = (err, payload) => {
      if (err) {
        console.error(err.message);
        return;
      }

      this.setState(payload);
    };

    this.client.watchQuery(helloWorldQuery, {}, watchHandler);
  }

  setPayload() {
    return this.client.cache.setItemPayload(
      helloWorldQuery,
      {},
      {
        helloWorld: "Hello World set via Cache"
      }
    );
  }

  render() {
    const { helloWorld } = this.state;
    return (
      <section>
        <p>{helloWorld} from Lokka</p>
        <button onClick={this.setPayload}> Set item in Cache </button>
      </section>
    );
  }
}
