#!/bin/bash
set -e

echo "Publishing to Azure Artifacts..."
echo "@YOUR_SCOPE:registry=https://pkgs.dev.azure.com/YOUR_ORG/_packaging/YOUR_FEED/npm/registry/" > .npmrc
echo "always-auth=true" >> .npmrc
echo "//pkgs.dev.azure.com/YOUR_ORG/_packaging/YOUR_FEED/npm/registry/:_authToken=\${AZURE_NPM_TOKEN}" >> .npmrc
npm publish

echo "Publishing to JFrog Artifactory..."
echo "@YOUR_SCOPE:registry=https://YOUR_COMPANY.jfrog.io/artifactory/api/npm/npm-repo/" > .npmrc
echo "always-auth=true" >> .npmrc
echo "//YOUR_COMPANY.jfrog.io/artifactory/api/npm/npm-repo/:_authToken=\${JFROG_NPM_TOKEN}" >> .npmrc
npm publish

echo "Publishing complete."
