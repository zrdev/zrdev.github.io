#!/bin/bash

if [[ $1 != "--prod" && $1 != "--qa" ]]; then
	echo "Run this script with options --qa or --prod to deploy."
	exit
fi

rm -rf build
mkdir build

#Minify and concatenate JS
./build.py
mkdir build/js
mkdir build/blockly
cat blockly_compressed.js blocks_compressed.js zr_cpp_compressed.js blockly/msg/js/en.js > build/blockly/blockly.min.js
mv zr_compressed.js build/js/zr.min.js
rm *_compressed.js

#Update file modificaiton dates to commit date (important for deployment!)
./chdates.py

#Build deployment package
cp -Rp css/ build/css/
cp -Rp docs/ build/docs/
cp -Rp images/ build/images/
cp -Rp partials/ build/partials/
cp -Rp visualizer/ build/visualizer/
cp -Rp blockly/media/ build/blockly/media/
cp -Rp blockly/games/ build/blockly/games/
if [ $1 == "--prod" ]; then
	cp -p index-prod.html build/index.html
elif [ $1 == "--qa" ]; then
	cp -p index-qa.html build/index.html
fi

#Deploy to S3 bucket
if [ $1 == "--prod" ]; then
	aws s3 sync build/ s3://zerorobotics.mit.edu/ --delete --exclude "*.DS_Store"
elif [ $1 == "--qa" ]; then
	aws s3 sync build/ s3://zr-qa/ --delete --exclude "*.DS_Store"
fi

echo "Deploy complete"