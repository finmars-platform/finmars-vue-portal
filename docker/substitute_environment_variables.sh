#!/bin/sh

ROOT_DIR=/var/www/finmars


PROD_KEYCLOAK_URL="${PROD_KEYCLOAK_URL:-https://dev-auth.finmars.com}"
PROD_KEYCLOAK_REALM="${PROD_KEYCLOAK_REALM:-finmars}"
PROD_KEYCLOAK_CLIENT_ID="${PROD_KEYCLOAK_CLIENT_ID:-finmars}"

echo PROD_FRONT_HOST $PROD_FRONT_HOST
echo NUXT_APP_BASE_URL $NUXT_APP_BASE_URL
echo NUXT_APP_BUILD_ASSETS_DIR $NUXT_APP_BUILD_ASSETS_DIR
echo PROD_API_HOST $PROD_API_HOST
echo PROD_KEYCLOAK_URL $PROD_KEYCLOAK_URL
echo PROD_KEYCLOAK_REALM $PROD_KEYCLOAK_REALM
echo PROD_KEYCLOAK_CLIENT_ID $PROD_KEYCLOAK_CLIENT_ID


# Replace env vars in .mjs files served by server
# Exclude /node_modules folder from the search and replacement
find "$ROOT_DIR/.output/" -type f -name "*.mjs" ! -path "$ROOT_DIR/.output/server/node_modules/*" |
while read -r file;
do
  sed -i 's|==PROD_FRONT_URL==|'${PROD_FRONT_URL}'|g' $file
  sed -i 's|==NUXT_APP_BASE_URL==|'${NUXT_APP_BASE_URL}'|g' $file
  sed -i 's|==NUXT_APP_BUILD_ASSETS_DIR==|'${NUXT_APP_BUILD_ASSETS_DIR}'|g' $file
  sed -i 's|==PROD_API_HOST==|'${PROD_API_HOST}'|g' $file
  sed -i 's|==PROD_KEYCLOAK_URL==|'${PROD_KEYCLOAK_URL}'|g' $file
  sed -i 's|==PROD_KEYCLOAK_REALM==|'${PROD_KEYCLOAK_REALM}'|g' $file
  sed -i 's|==PROD_KEYCLOAK_CLIENT_ID==|'${PROD_KEYCLOAK_CLIENT_ID}'|g' $file

done

echo "DONE REPLACE"
# Starting server
PORT=8080 node .output/server/index.mjs
