/* global onMessage:true, postMessage:true */

import tensorjs from 'tensorjs';
import TFJS from 'tfjs';
import {loadGraph, loadGraphAsArrayBuffer, topK} from '../lib/utils';

self._lib = undefined;
self._sess = undefined;

// Messages are of the type:
//
// {
//   type: ...
//   data: ...
// }
self.onmessage = function (msg) {
  console.log("Recieved Message in Worker:", msg);

  if (!self._sess) {
    throw "Must wait for initialization!"; // eslint-disable-line no-throw-literal
  }

  if (msg.data.type === "COMPUTE_REQUEST") {
    console.log("Beginning compute request in worker...");

    const results = self._sess.run(
      {
        "Mul:0": msg.data.data
      },
      ["softmax:0"]
    );

    console.log("Finishing compute request in worker...");

    self.postMessage({
      type: "COMPUTE_RESPONSE",
      data: results
    });
  }
};

TFJS
  .for_web_worker('/tensorflowjs/')
  .then(lib => {
    self._lib = lib;
    return loadGraphAsArrayBuffer("/graphs/inception.stripped.pb");
  })
  .then(graph => {
    self._sess = new self._lib.Session(graph);
    self.postMessage({
      type: "DONE_INIT"
    });
  });
