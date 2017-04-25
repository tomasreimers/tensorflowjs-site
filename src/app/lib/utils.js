const _ = require('lodash');

export function loadGraphAsArrayBuffer(graph) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", graph, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (ev) {
      const arrayBuffer = oReq.response; // Note: not oReq.responseText
      if (arrayBuffer) {
        const byteArray = new Uint8Array(arrayBuffer);

        resolve(byteArray);
      }
    };

    oReq.send(null);
  });
}

export function loadText(url) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "text";

    oReq.onload = function (ev) {
      resolve(oReq.responseText);
    };

    oReq.send(null);
  });
}

export function loadGraph(graph) {
  return loadGraphAsArrayBuffer(graph)
    .then(byteArray => {
      // convert to string
      let graph = "";
      for (let ii = 0; ii < byteArray.length; ii++) {
        graph += String.fromCharCode(byteArray[ii]);
      }

      return graph;
    });
}

export function topK(arr, k) {
  // this is currently O(N log N), the correct solution is O(N log K), consider fixing
  // can do O(N log K) by using a heap or by maintaining a sorted list of size K as you iterate through the array

  const enumerated = _.map(arr, (x, idx) => {
    return [idx, x];
  });

  const sorted = _.orderBy(enumerated, x => {
    return x[1];
  }, 'desc');

  return _.slice(sorted, 0, k);
}
