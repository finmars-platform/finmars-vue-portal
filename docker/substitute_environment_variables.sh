#!/bin/sh

ROOT_DIR=/var/www/finmars

# Replace env vars in files served by NGINX
for file in $ROOT_DIR/.output/**/*.mjs* $ROOT_DIR/.output/public/index.html;
do
  sed -i 's|PROD_APP_URL|'${PROD_APP_URL}'|g' $file
  sed -i 's|PROD_API_URL|'${PROD_API_URL}'|g' $file
  sed -i 's|PROD_WS_URL|'${PROD_WS_URL}'|g' $file
  sed -i 's|PROD_OLD_APP_URL|'${PROD_OLD_APP_URL}'|g' $file
  # Your other variables here...
done
# Starting server
npm start
