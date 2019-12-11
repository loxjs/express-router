npm run lint
npm run build
cd lib
npm config set registry https://registry.npmjs.org/
npm publish . --access=public
npm config set registry https://registry.npm.taobao.org
cd ..