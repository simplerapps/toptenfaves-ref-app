#!/bin/sh

echo '\nRnning grunt to build release..'
grunt 

echo '\nNow deploying release..'

REL_PATH=/Users/samiadranly/dev-research/projects-pg/share10/platforms/ios/www

rm -rf $REL_PATH/*

cp -r ../../* $REL_PATH

cp ../../index-prod-pg.html $REL_PATH/index.html
cp ../../index-prod-web.html ../../index.html

# delete folders
rm -rf $REL_PATH/app/comp
rm -rf $REL_PATH/app/build
rm -rf $REL_PATH/app/res-art
rm -rf $REL_PATH/app/tests
rm -rf $REL_PATH/WEB-INF

# delete files
rm -rf $REL_PATH/app/lib/sa/sa.js
rm -rf $REL_PATH/app/lib/app/app.js
rm -rf $REL_PATH/index-prod-web.html
rm -rf $REL_PATH/index-prod-pg.html
rm -rf $REL_PATH/index-dev.html
rm -rf $REL_PATH/favicon.ico



