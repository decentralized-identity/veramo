FROM node:12
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN yarn bootstrap
RUN yarn build
ENTRYPOINT ["./packages/cli/bin/veramo.js"]