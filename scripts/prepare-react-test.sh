#!/bin/bash

projectRoot=$(pwd)
reactSampleDir="$projectRoot/__browser_tests__/react-sample"

packages=(
"core"
"credential-ld"
"credential-w3c"
"data-store"
"data-store-json"
"did-comm"
"did-discovery"
"did-jwt"
"did-manager"
"did-provider-ethr"
"did-provider-key"
"did-provider-web"
"did-resolver"
"key-manager"
"kms-local"
"message-handler"
"remote-client"
"remote-server"
"selective-disclosure"
"url-handler"
"utils"
);

for package in "${packages[@]}"; do
  path="$projectRoot/packages/$package"
  cd $path
  yarn link
  cd -
done

cd $reactSampleDir

for package in "${packages[@]}"; do
  yarn link "@veramo/$package"
done

cd -