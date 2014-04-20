#!/bin/bash

rm -rf build
mkdir build

#Minify and concatenate JS
./build.py
mkdir build/js
mkdir build/blockly
cat blockly_compressed.js blocks_compressed.js zr_cpp_compressed.js blockly/msg/js/en.js > build/blockly/blockly.min.js
mv zr_compressed.js build/js/zr.min.js
rm *_compressed.js

cp -R css/ build/css/
cp -R docs/ build/docs/
cp -R images/ build/images/
cp -R partials/ build/partials/
cp -R visualizer/ build/visualizer/
cp -R blockly/media/ build/blockly/media/
cp -R blockly/games/ build/blockly/games/
cp index-prod.html build/index.html
cp manifest.mf build/manifest.mf

aws s3 sync build/ s3://zerorobotics.org/ --delete --exclude "*.DS_Store"