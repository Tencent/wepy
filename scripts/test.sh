#!/bin/bash
cd packages/babel-plugin-import-regenerator && npm run test && cd ../../
cd packages/cli && npm run test && cd ../../

# TODO: cd packages/compiler-babel && npm run test && cd ../../
cd packages/compiler-less && npm run test && cd ../../
cd packages/compiler-sass && npm run test && cd ../../
# TODO: cd packages/compiler-stylus && npm run test && cd ../../
# TODO: cd packages/compiler-typescript && npm run test && cd ../../
# TODO: cd packages/core && npm run test && cd ../../
cd packages/plugin-define && npm run test && cd ../../
# TODO: cd packages/plugin-eslint && npm run test && cd ../../
# TODO: cd packages/plugin-uglifyjs && npm run test && cd ../../
# TODO: cd packages/redux && npm run test && cd ../../
# TODO: cd packages/use-promisify && npm run test && cd ../../
# TODO: cd packages/x && npm run test && cd ../../
