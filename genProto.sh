#!/bin/sh

protoc \
  --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
  -I src/proto \
  --js_out=import_style=commonjs,binary:./src/generated \
  ./src/proto/*.proto

protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  -I src/proto \
  --ts_out=./src/generated \
  ./src/proto/*.proto