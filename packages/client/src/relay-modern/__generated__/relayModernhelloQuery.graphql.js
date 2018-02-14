/**
 * @flow
 * @relayHash 047c2d92f2490733270666dab01078cd
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type relayModernhelloQueryResponse = {|
  +helloWorld: ?string;
|};
*/


/*
query relayModernhelloQuery {
  helloWorld
}
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "relayModernhelloQuery",
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "args": null,
        "name": "helloWorld",
        "storageKey": null
      }
    ],
    "type": "Query"
  },
  "id": null,
  "kind": "Batch",
  "metadata": {},
  "name": "relayModernhelloQuery",
  "query": {
    "argumentDefinitions": [],
    "kind": "Root",
    "name": "relayModernhelloQuery",
    "operation": "query",
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "args": null,
        "name": "helloWorld",
        "storageKey": null
      }
    ]
  },
  "text": "query relayModernhelloQuery {\n  helloWorld\n}\n"
};

module.exports = batch;
