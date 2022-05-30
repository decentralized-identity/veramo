FROM node:18
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN yarn bootstrap
RUN yarn build
ENTRYPOINT ["./packages/cli/bin/veramo.js"]