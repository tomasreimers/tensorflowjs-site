import React, {Component} from 'react';

export class About extends Component {
  render() {
    return (
      <div className="container">
        <h2>About</h2>
        <p>
          Hi, my name is Tomas! I am a senior at Harvard College, and this is part of
          my senior thesis! I've been working on this project since September,
          so I have a lot to share. I intend to release a sequence of blog posts
          to help anyone interested in this field (or maybe I'll just post the
          thesis online). For now, I wanted to share with you how I got TensorFlow
          running in the browser, and how you can too!
        </p>
        <h2>TensorFlow Core</h2>
        <p className="note">
          <a href="https://github.com/tomasreimers/tensorflow-emscripten">https://github.com/tomasreimers/tensorflow-emscripten</a>
        </p>
        <p>
          To get TensorFlow running in the browser, we decided to compile it rather
          than attempt to port it (although there is an awesome project to
          port <a href="https://github.com/transcranial/keras-js">keras</a> into JS).
          This decision was driven by a realization that TensorFlow (and machine learning)
          is still rapidly changing, and we wanted to be at the bleeding edge, as opposed
          to be lagged behind by the speed of porting. Over the course of this project,
          tensorflow has jumped from v0.10 to v0.11 to v0.12 to v1.0, each version bump
          took us &lt;10 minutes to update, despite huge changes to the codebase.
          Additionally, ASM.js (our compile target) gives us some pretty awesome speed benefits.
        </p>
        <p>
          To port over to JS, we decided to use <a href="http://kripken.github.io/emscripten-site/">Emscripten</a>,
          a drop-in replacement for GCC that compiles C/C++ into LLVM-IR and then into <a href="http://asmjs.org/">ASM.js</a> (a
          subset of Javsacript meant to be used as a compile target). Emscripten has been used to port everything from games
          to physics engines, and is used in production by companies such as <a href="https://www.figma.com">Figma</a>.
          ASM apps report seeing up speeds as low as only 2x slower than native bytecode, and firefox even fasttracks ASM code.
          Emscripten can also compile into <a href="http://webassembly.org/">WebAssembly</a>, and we've begun to look into that.
        </p>
        <p>
          Emscripten requires a Makefile (where we can swap out the compiler), and
          TensorFlow is compiled with <a href="https://bazel.build/">Bazel</a>,
          Google's build tool. We considered extending the bazel files to include
          a <a href="https://github.com/bazelbuild/bazel/wiki/Building-with-a-custom-toolchain">CrossTool</a> but
          concluded it would make maintence more difficult and lose the 'bleeding-edge'
          advantage we were seeking. Fortuntely, Google maintains
          a <a href="https://github.com/tensorflow/tensorflow/tree/master/tensorflow/contrib/makefile">Makefile</a> for
          android and iOS, so we decided to extend that. This means that we would be compiling with the same
          ops that one compiles for Android or iOS (for more on ops or how TF works in general, please see:
          <a href="https://www.tensorflow.org/versions/r0.10/get_started/basic_usage">https://www.tensorflow.org/versions/r0.10/get_started/basic_usage</a>).
          We experimented (and succeeded) with including other ops, such as the Image ops (i.e. DecodeJpeg), but decided against keeping it for simplicity's sake
          (as it required us to also port and maintain libjpeg, libpng, and libgif in JS).
          See <a href="https://github.com/tomasreimers/tensorflow-emscripten/tree/saved_v0.10.0">this branch</a> for
          a version pinned at v0.10 with the image ops included.
        </p>
        <p>
          To compile TensorFlow into JavaScript, there are three major things
          that need to happen: (1) port dependencies to JS,
          (2) fix types, and (3) single thread it. Porting dependencies was rather
          straight forward: Zlib already has an <a href="https://github.com/emscripten-ports/zlib">emscripten port</a>,
          libmath ships with Emscripten, and there was <a href="https://github.com/invokr/protobuf-emscripten">prior work for protobufs</a>,
          but we <a href="https://github.com/tomasreimers/protobuf-emscripten">forked it</a> and made our own so we could pin versions.
          Next up was types, TensorFlow uses Eigen as it's linear algebra library. Eigen defines a type called Eigen::Scalar (or Eigen::Index)
          and <a href="https://github.com/RLovelett/eigen/blob/f14463caef30220c1bc65510e3103d170908fefb/Eigen/src/Core/util/Meta.h#L25">defines it</a>
          as <a href="https://github.com/RLovelett/eigen/blob/c357eb377661d0674e5bc1acab48a4957d3d671f/Eigen/src/Core/util/Macros.h#L336">std::ptr_diff</a>,
          to match the bitness of the host. Because TensorFlow officially only supports 64b systems, it sets Eigen::Scalars to be int64_t regularly. This
          is a problem because JavaScript only has doubles, so we only have 53b of integer precision. This forces Emscripten to define ptrdiff_t as 32,
          which in turn causes the compiler to throw an error; we fixed this by replacing all the int64 with Eigen::Index or Eigen::Scalar. The last issue
          to resolve was single threading, currently JavaScript isn't capable of doing threads (although Firefox
          is <a href="https://hacks.mozilla.org/2016/05/a-taste-of-JavaScripts-new-parallel-primitives/">working on it</a>.)
          This poses a problem, because TensorFlow uses a lot of threading. TensorFlow's computational model is to dispatch work (in the form of closures) to
          a threadpool. To singlethread this, we can simply replace the dispatch function with a function that executes the closure and returns. This also
          automatically works with all of the synchronization mechanisms because all varriers have been satisified by the time they are reached (as the
          paradigm is to dispatch work and then wait on it).
        </p>
        <p>
          Having fixed all the problems, we can now compile TensorFlow into an archive we can link other programs against and compile to JavaScript.
        </p>
        <h2>TensorJS</h2>
        <p className="note">
          <a href="https://github.com/tomasreimers/tensorjs">https://github.com/tomasreimers/tensorjs</a>
        </p>
        <p>
          Emscripten provides good interfaces to call functions with numbers, strings, and even vectors. Unfortunately, this isn't rich enough for our inputs,
          Tensors. This is problematic, because most use cases requires us to run models on user provided inputs (there isn't much sense in running
          graphs client-side on the same host-provided input). We explored a few solutions, including writing and reading images from Emscripten's
          mock file system (for image recognition) or using JSON. We settled on using Google's tensor protobuf used internally in TensorFlow.
        </p>
        <p>
          We developed the library TensorJS to read and write tensor protobufs from JavaScript multi-dimensional arrays. Currenlty it supports int tensors and
          float tensors.
        </p>
        <h2>Graph Runner</h2>
        <p className="note">
          <a href="https://github.com/tomasreimers/tensorflowjs">https://github.com/tomasreimers/tensorflowjs</a>
        </p>
        <p>
          At this point we could compile C/C++ programs that used TensorFlow into JavaScript, and we could call them
          with Tensors from JavaScript. We started to notice that all programs kinda look similar (you create a session,
          pass it a graph, and then feed inputs to the graph while fetching outputs). We decided to generalize this and
          wrote a universal graph runner that could be used to execute any arbitrary graph. The graph runner is compiled
          by the main tensorflow-emscripten repository, but we export the build files here so that you don't have to build
          it yourself.
        </p>
        <p className="note">
          NOTE: It may still make sense to build your own version of graph runner if you need certain ops, or wish to
          exclude one's you're not using (per <a href="https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/tools/print_selective_registration_header.py">the selective registration header</a>).
        </p>
        <h2>TFJS</h2>
        <p className="note">
          <a href="https://github.com/tomasreimers/tfjs">https://github.com/tomasreimers/tfjs</a>
        </p>
        <p>
          Even with the universal graph runner, there were still small frictions in writing programs (e.g. Emscripten forces
          you to delete any objects that functions return, because it can't tell when they're done). So we created a wrapper for
          TensorFlow.js which provides (almost) the same API as Python.
        </p>
      </div>
    );
  }
}
