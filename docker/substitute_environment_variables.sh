#!/bin/sh

ROOT_DIR=/var/www/finmars

echo PROD_FRONT_HOST $PROD_FRONT_HOST
echo NUXT_APP_BASE_URL $NUXT_APP_BASE_URL
echo PROD_API_HOST $PROD_API_HOST
echo PROD_WS_HOST $PROD_WS_HOST

echo PROD_CLOACK_PASS $PROD_CLOACK_PASS
echo PROD_CLOACK_2fa $PROD_CLOACK_2fa

echo KEYCLOAK_ACCOUNT_PAGE $KEYCLOAK_ACCOUNT_PAGE

# Replace env vars in files served by server
for file in $ROOT_DIR/.output/**/*.mjs* $ROOT_DIR/.output/server/chunks/nitro/node-server.mjs
do
  sed -i 's|==PROD_FRONT_URL==|'${PROD_FRONT_URL}'|g' $file
  sed -i 's|==NUXT_APP_BASE_URL==|'${NUXT_APP_BASE_URL}'|g' $file
  sed -i 's|==PROD_API_HOST==|'${PROD_API_HOST}'|g' $file
  sed -i 's|==PROD_WS_HOST==|'${PROD_WS_HOST}'|g' $file
  sed -i 's|==PROD_CLOACK_PASS==|'${PROD_CLOACK_PASS}'|g' $file
  sed -i 's|==PROD_CLOACK_2fa==|'${PROD_CLOACK_2fa}'|g' $file
	sed -i 's|==KEYCLOAK_ACCOUNT_PAGE==|'${KEYCLOAK_ACCOUNT_PAGE}'|g' $file

done

#grep -rnw '/var/www/finmars/' -e 'PROD_APP_URL'

echo "DONE REPLACE"
# Starting server
npm start
