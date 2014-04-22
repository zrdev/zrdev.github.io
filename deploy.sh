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

cp -Rp css/ build/css/
cp -Rp docs/ build/docs/
cp -Rp images/ build/images/
cp -Rp partials/ build/partials/
cp -Rp visualizer/ build/visualizer/
cp -Rp blockly/media/ build/blockly/media/
cp -Rp blockly/games/ build/blockly/games/
cp -p index-prod.html build/index.html
cp -p manifest.mf build/manifest.mf

aws s3 sync build/ s3://zerorobotics.org/ --delete --exclude "*.DS_Store"