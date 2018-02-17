Over the past few weeks a lot of new GraphQL clients were released aiming to give Relay and Apollo a run for their money! It's true, there is still plenty of areas to explore when it comes to GraphQL clients and I hope the result of all this is a "melting pot" of advances in developer experience.

I wanted to study how these clients work, so I aimed to implement the same query using different clients and share my experience.

The GraphQL Clients we explored are:

* FetchQL
* GraphQL Request
* Apollo Fetch
* Lokka
* Micro GraphQL React
* URQL
* Apollo Client
* Relay Modern

All were using React as the view layer.

Before we get into the different clients I'd like to explain what exactly a GraphQL client is.

If you boil it down to the basics, a GraphQL client is code that makes a POST request to a GraphQL Server. In the body of the request we send a GraphQL query or mutation as well as some variables and we expect to get some JSON back.

```graphql
query example($someVariable: String) {
  someField(someVariable: $someVariable) {
    field1
    field2
  }
}
```

```bash
curl -XPOST -H "Content-Type:application/json"  -d 'query hello { helloWorld }' http://localhost:3000/graphql
```

From my experience there are 2 main types of GraphQL Clients.

### Fetch Client
A fetch client handles sending GraphQL queries/mutation and variables to the GraphQL server in an ergonomic way for the developer.

### Caching Client
A caching client does the same thing as a fetch client, but includes a way for the application to store data in memory. These clients are built to reduce network trips the application makes and provides a helping hand in managing application state. With a caching client you can keep your data layer concerns separate from your view layer.


You should use a GraphQL client for work that sits at an agnostic layer of your application. You shouldn't have to worry about networking details or roll your own cache for the query results.


Now that we had a brief rundown on what a GraphQL Client is, lets start exploring some clients.

Our goal is make this query:

```
query hello {
  helloWorld
}
```

and discuss our experience.

// put github link

## FetchQL

The first client I took a look at was FetchQL. This client is a super basic fetch client!

```js
import FetchQL from "fetchql";

const client = new FetchQL({ url: "/graphql" });

client.query({ operationName: 'hello', query: helloWorldQuery }).then(result => {
  // do something with the result
});
```

Hooking requests in a React components `componentDidMount`, you can set state to your component pretty easily!
What I really did not like about this client was the friction with adding an `operationName` to the query. Ideally
you should be able to read that from the query itself, but thats okay. Still very easy to get up and running.

## GraphQL Request

Next we took a look at another fetch client. `graphql-request` from my friends at graphcool is just a convenient interface over the `fetch` api.

```js
import { GraphQLClient } from "graphql-request";

const client = new GraphQLClient("/graphql");

this.client.request(helloWorldQuery).then(data => {
  // do something
});
```

Nothing else to it! Pretty simple. I usually use this library for server to server graphql communication! Only critique on `graphql-request` is that it wasn't immediately obvious that I can pass any options `fetch` supports (it does). So all this needs is a little documentation upgrade!

## Apollo Fetch

So when it comes to Apollo I am extremely biased haha. Apollo Fetch is but a small cog in the overall GraphQL client that is Apollo Client. But, you can still use it as a dead simple fetch client!!

```js
import { createApolloFetch } from "apollo-fetch";

const uri = "/graphql";
// create a fetcher
const fetcher = createApolloFetch({ uri });

fetcher({ query: helloWorldQuery }).then(result => {
  // do something
});
```

I'm starting to see a trend between all these fetch clients. Most of them use the `fetch` api and operate the same way. I'm starting to wonder why they exist?

## Micro GraphQL React
Micro GraphQL is created by Adam Rackis with the aim to have a simple client to connect React components to a GraphQL Server. It uses `graphql-request` under the hood as it's fetch client and has a built in cache stored at the component level.

Let's show an example:

```js
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
```

Instantiate a client instance like we're used to, then wrap the component in a `query` container to handle the fetch of the query and pass the `data` as props to the component. Under the hood, the component uses a `Map` to set the cache at the component level.

The caching goal here is to actually use a tool like Google's Workbox, or sw-toolbox to take the response from the HTTP requests and cache results there.

My critique for this client is the need to pass the client instance into the container component every time I need to make a query. Maybe with the new React Context API this can be passed a lot easier to child components! Also the caching at the component level for me is a little limiting, but this library clearly aims to solve this a certain way and thats okay!


## Lokka
Lokka by my friend Arunoda was one of the first clients aside from relay classic back before even Apollo existed! It also heavily inspired some of the clients you see today. I think the distinguishing factor is its separation of the "transport" or "network" interface e.g. "over what protocol are these requests going through?" and the actual mechanism by which results are cached. When we look at caching clients today they are very modular and I give props to Arunoda for being forward thinking. When you separate the network interface from the client code you give engineers the ability to send GraphQL requests over different protocols! Like Websockets or whatever else you want! I think it's also safe to assume that if you're using a fetch client, you're probably speaking HTTP!

Let's setup Lokka, it's super easy

```js
import { Lokka } from "lokka";
import { Transport } from "lokka-transport-http";

const client =  new Lokka({
  transport: new Transport("/graphql")
});

client.query(helloWorldQuery).then(result => {
  // do something
});
```

Lokka has a built in cache when using the `watchQuery` API.

```js
// watch the query
const watchHandler = (err, payload) => {
  if (err) {
    console.error(err.message);
    return;
  }

  // do something when the cache updates
};

client.watchQuery(helloWorldQuery, {}, watchHandler);
```

Any time the Lokka cache is updated, the registered handler function is called. This allows you to do a lot of different things in your UI in response to cache updates!

## URQL
URQL by Formidable Labs is a GraphQL client aiming to make the client side GraphQL workflow as simple as possible. Under the hood this uses a `fetch` api to handle the fetch client.

Let's write a simple example:

First we need to setup a Provider to pass the `client` instance to child components.
```js
import React from "react";
import { Provider, Client } from "urql";
import { helloWorldQuery } from "../queries";

const client = new Client({
  url: "/graphql"
});

export default function Root() {
  return (
    <Provider client={client}>
    </Provider>
  );
}
```

Next we need to use the `Connect` and `query` components to bind data to a component.
`Connect` uses the `render prop` pattern.

```js
<Connect query={query(helloWorldQuery)}>
  {({ loaded, refetch, data }) => {
    // write UI in here
  }}
</Connect>
```
 Don't like render props? You can use the `ConnectHOC` to do the same thing!

```js
export default ConnectHOC({
  query: query(helloWorldQuery)
})(MyComponent);
```
Thats it!

In regards to caching and control of that cache, URQL does a great job of exposing invalidation apis! The URQL cache is based on the `__typename` field in a GraphQL response. You can invalidate the cache pretty easily by passing a function, `shouldInvalidate`.

```js
shouldInvalidate={(changedTypenames, typenames, mutationResponse, data) => {
  return data.todos.some(d => d.id === mutationResponse.id);
}}
```

## Apollo Client
Apollo Client is a sophisticated caching GraphQL client.

Taken from my `How to GraphQL` course:

"Apollo Client is a community-driven effort to build an easy-to-understand, flexible and powerful GraphQL client. Apollo has the ambition to build one library for every major development platform that people use to build web and mobile applications. Right now there is a JavaScript client with bindings for popular frameworks like React, Angular, Ember or Vue as well as early versions of iOS and Android clients. Apollo is production-ready and has handy features like caching, optimistic UI, subscription support and many more."

Now I think the real reason a lot of these other clients came out was due to the complexity Apollo client was creating in response to bigger engineering teams using their software. Growing complexity is totally fine especially when you need to support tons of use cases, but through cycles of building engineers should come back to simplify and extend what they've built.

So while in Apollo v1, things were very easy to get up and running with, there have been critiques in the configuration overhead of v2.

v2 introduced concepts of custom cache control and networking layer. Which in my opinion is amazing if you are a large engineering team with custom use cases. But... if you are beginner or just trying to get something up and running, Apollo Client was becoming a big turnoff. Until now...

A couple days ago Peggy Rayzis released `Apollo Boost`.

What is Apollo Boost? Zero-config GraphQL state management. Dead simple.

You don't have to configure anything. the network layer? a `http-link` preconfigured for you. Cache? Apollo's fast `inMemoryCache` already setup. You just need to build now, let's do that:

First we import the `ApolloClient` constructor from `apollo-boost`. This has the client you need preconfigured with a cache and network interface. Then we get the `ApolloProvider` component to pass down the `client` to all child components.

```js
import React from "react";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

// Pass your GraphQL endpoint to uri
const client = new ApolloClient({ uri: "/graphql" });

export default function Root() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}
```
Next we make a component.

React Apollo in vNext, uses a `Query` component that provides a `render prop`.

```js
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
import { helloWorldQuery } from "../queries";

const query = gql(helloWorldQuery);

const App = () => (
  <Query query={query}>
    {({ loading, error, data }) => {
      if (loading) return <p>Loading data from Apollo Client...</p>;

      return <p>{data && data.helloWorld} from Apollo Client</p>;
    }}
  </Query>
);
```

Don't like render props? You can use the `graphql` HOC:

```js
export default graphql(gql(helloWorldQuery))(MyComponent);
```

We see something similar here between Apollo and URQL. They both wrap their GraphQL query/mutation with a wrapping function.

`URQL` has `query` that wraps the query
`Apollo Client` uses the `graphql-tag` library to wrap the query.

When you're dealing with a fetch client, all you really need is a GraphQL string and a post request to a server. The server will then parse validate and execute that query. When you're dealing with a sophisticated cache on the client side, working with strings suck. You really want to have a structured object to work with. So these 2 ways take a GraphQL string and turn it in a GraphQL AST representing that string. Then library authors can manipulate them a lot easier!

## Relay Modern
Relay Modern developed by Facebook is a GraphQL client with performance as it's main objective. Graduating from it's previous iteration, Relay Classic, Relay Modern aims to improve on it's API and reduce the overall size.

To get started though, you do have to jump through a few hoops:

You'll need 3 libraries:

`react-relay` for the React integration!

`relay-compiler` and `babel-plugin-relay` to enable a ahead of time compilation of queries/mutations

Much like the other GraphQL clients, we need to setup our `network` interface and `cache`. In Relay this is expressed as the `Environment`.

```js
import { Environment, Network, RecordSource, Store } from "relay-runtime";

const store = new Store(new RecordSource());

const network = Network.create((operation, variables) => {
  return fetch("/graphql", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: operation.text,
      variables
    })
  }).then(response => {
    return response.json();
  });
});

export default new Environment({
  network,
  store
});
```

Relay comes with some out of the box components you can configure. We create a `store` to hold out results and create a network interface using `fetch`. But you could technically insert any fetch client in the Network create function.

Okay now let's render a query:

```js
import React from "react";
import { QueryRenderer, graphql } from "react-relay";
import environment from "./environment";

const query = graphql`
  query hello {
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
          return <p>{error.message}</p>;
        } else if (props) {
          return <p>{props.helloWorld} from Relay Modern</p>;
        }
        return <p>Loading your Relay Modern data...</p>;
      }}
    />
  );
}
```

We can see come commonalities here:

1. The use of `graphql` to take a query string and use a GraphQL AST under the hood.
2. The `QueryRenderer`, much like `Query` or `Connect` that allows you to render a component based on data.

Thing that felt off:

Before starting the application I needed to run the relay compiler:

`relay-compiler --src ./src --schema ./schema.graphql` pointing to my schema in the server folder. If building a Relay app, you should probably keep your schema accessible in a shared place!

After running this compiler I got an error!

```
Operation names in graphql tags must be prefixed with the module name and end in "Mutation", "Query", or "Subscription". Got `hello` in module `relayModern`.
```

I stared this error and was really taken a back. Seems pretty annoying to have to do this, but meh, let's keep going:

Change up my query to this:

```js

const query = graphql`
  query relayModernhelloQuery {
    helloWorld
  }
`;
```

Run the compiler now, run the app, all is good! Relay is a powerful tool but I think the least approachable out of all the GraphQL Clients out there. The client has different concerns and tons of use cases to back it up, so I have no problem with its design!

# Conclusion

So having explored these clients I've come to realize a few things:

1. We have too many fetch clients out there. Many of the clients that just help you do POST requests via `fetch` aren't really providing any extra value. I'd probably stick to recommending `graphql-request`, or if you're more familiar with Apollo using `apollo-fetch`.

2. Clients that do support caching are relatively doing things similarly. Between Apollo, and Relay you can clearly see a modular separation of concerns between the `networking` and the `cache` details.

3. Users of clients like `URQL` and `Micro GraphQL` are looking for a client that is easy to configure and work with right away.

4. The key for new user adoption is a client that handles these concerns for you with escape hatches for customization when needed. I'm super excited for `Apollo Boost` and there's a project that is similar for relay https://github.com/releasy/react-releasy

I'm so happy the community is coming together around different ideas and making things easier for engineers going forward!

Cheers.
