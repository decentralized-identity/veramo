FROM node:10
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN yarn bootstrap
RUN yarn build
ENTRYPOINT ["./packages/daf-cli/bin/daf.js"]