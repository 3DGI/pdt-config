#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

rsync -rzhP --delete --exclude=".*" . do:/home/ylan/webapps/3dgi-dev/pdt-config

cd -
