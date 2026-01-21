#!/bin/sh

ROOT_DIR=/var/www/finmars

PROD_KEYCLOAK_URL="${PROD_KEYCLOAK_URL:-https://dev-auth.finmars.com}"
PROD_KEYCLOAK_REALM="${PROD_KEYCLOAK_REALM:-finmars}"
PROD_KEYCLOAK_CLIENT_ID="${PROD_KEYCLOAK_CLIENT_ID:-finmars}"
PROD_EDITION_TYPE="${PROD_EDITION_TYPE:-enterprise}"

echo PROD_FRONT_HOST $PROD_FRONT_HOST
echo NUXT_APP_BASE_URL $NUXT_APP_BASE_URL
echo NUXT_APP_BUILD_ASSETS_DIR $NUXT_APP_BUILD_ASSETS_DIR
echo PROD_API_HOST $PROD_API_HOST
echo PROD_KEYCLOAK_URL $PROD_KEYCLOAK_URL
echo PROD_KEYCLOAK_REALM $PROD_KEYCLOAK_REALM
echo PROD_KEYCLOAK_CLIENT_ID $PROD_KEYCLOAK_CLIENT_ID
echo PROD_EDITION_TYPE $PROD_EDITION_TYPE
echo SENTRY_DSN $SENTRY_DSN

# Export variables so the Node script can see them
export PROD_FRONT_HOST NUXT_APP_BASE_URL NUXT_APP_BUILD_ASSETS_DIR
export PROD_API_HOST PROD_KEYCLOAK_URL PROD_KEYCLOAK_REALM
export PROD_KEYCLOAK_CLIENT_ID PROD_EDITION_TYPE SENTRY_DSN

echo "Starting Environment Replacement..."

# --- BEGIN NODE.JS REPLACEMENT SCRIPT ---
# We write a small temporary .mjs script to handle replacement natively/safely
cat << EOF > replacer.mjs
import fs from 'node:fs';
import path from 'node:path';

const rootDir = '${ROOT_DIR}/.output';
const skipDir = path.join(rootDir, 'server/node_modules');

// Map of placeholder -> Env Var
const replacements = {
  '==PROD_FRONT_HOST==': process.env.PROD_FRONT_HOST,
  '==NUXT_APP_BASE_URL==': process.env.NUXT_APP_BASE_URL,
  '==NUXT_APP_BUILD_ASSETS_DIR==': process.env.NUXT_APP_BUILD_ASSETS_DIR,
  '==PROD_API_HOST==': process.env.PROD_API_HOST,
  '==PROD_KEYCLOAK_URL==': process.env.PROD_KEYCLOAK_URL,
  '==PROD_KEYCLOAK_REALM==': process.env.PROD_KEYCLOAK_REALM,
  '==PROD_KEYCLOAK_CLIENT_ID==': process.env.PROD_KEYCLOAK_CLIENT_ID,
  '==PROD_EDITION_TYPE==': process.env.PROD_EDITION_TYPE,
  '==SENTRY_DSN==': process.env.SENTRY_DSN,
};

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fp = path.join(dir, file);
    
    // Skip node_modules
    if (fp.startsWith(skipDir)) continue;

    if (fs.statSync(fp).isDirectory()) {
      walk(fp);
    } else if (file.endsWith('.mjs')) {
      let content = fs.readFileSync(fp, 'utf8');
      let changed = false;
      
      // Perform all replacements
      for (const [placeholder, value] of Object.entries(replacements)) {
        if (value && content.includes(placeholder)) {
          // split/join is a safe way to replace all occurrences without Regex issues
          content = content.split(placeholder).join(value);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fp, content);
        console.log(`Updated: ${file}`);
      }
    }
  }
}

walk(rootDir);
EOF
# --- END NODE.JS REPLACEMENT SCRIPT ---

# Execute the script using the node runtime you already have
node replacer.mjs

# Cleanup
rm replacer.mjs

echo "DONE REPLACE"

# Starting server
PORT=8080 node .output/server/index.mjs
