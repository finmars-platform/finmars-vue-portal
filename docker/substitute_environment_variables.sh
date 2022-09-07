#!/bin/sh

ROOT_DIR=/var/www/finmars

echo PROD_APP_URL $PROD_APP_URL
echo PROD_API_URL $PROD_API_URL
echo PROD_WS_URL $PROD_WS_URL
echo PROD_OLD_APP_URL $PROD_OLD_APP_URL

# Replace env vars in files served by server
for file in $ROOT_DIR/.nuxt/**/*.mjs* $ROOT_DIR/.output/**/*.mjs* $ROOT_DIR/nuxt.config.ts $ROOT_DIR/.output/**/*.html*
do
  sed -i 's|PROD_APP_URL|'${PROD_APP_URL}'|g' $file
  sed -i 's|PROD_API_URL|'${PROD_API_URL}'|g' $file
  sed -i 's|PROD_WS_URL|'${PROD_WS_URL}'|g' $file
  sed -i 's|PROD_OLD_APP_URL|'${PROD_OLD_APP_URL}'|g' $file
done

#grep -rnw '/var/www/finmars/' -e 'PROD_APP_URL'

echo "DONE REPLACE"
# Starting server
npm start
