`docker build -t lambda-sharp .`

`docker run --rm -v $(pwd):/app lambda-sharp npm install`

`zip -r function.zip index.mjs node_modules package.json`
