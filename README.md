# Nuxt 3 Minimal Starter

Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

Create file .env in project's root directory.

.env example:

```txt
NUXT_APP_BUILD_ASSETS_DIR='/realm00000/v/_nuxt/'

KEYCLOAK_URL='https://stage-auth.finmars.com'
KEYCLOAK_REALM='finmars'
KEYCLOAK_CLIENT_ID='finmars'

APP_HOST='http://localhost:3000/v'
API_HOST='https://stage.finmars.com'
AUTH_HOST='https://stage.finmars.com/authorizer'

OLD_APP_URL='http://0.0.0.0:8080/#!/'
NUXT_HOST='localhost'
```

For `NUXT_APP_BUILD_ASSETS_DIR` replace `realm00000` with the one that will be used

Run command:

```bash
npm run dev
```

For locally deployed backend run command:

```bash
npm run dev-local
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment) for more information.


## Local Development with local backend & authorizer

Create .env

.env example
 
```
KEYCLOAK_URL=https://dev-auth.finmars.com
KEYCLOAK_REALM=finmars
KEYCLOAK_CLIENT_ID=finmars
NUXT_APP_BASE_URL=/realm00000/v/
APP_HOST=http://0.0.0.0:3000/realm00000/v/
AUTH_HOST=http://0.0.0.0:8083/authorizer
API_HOST=http://0.0.0.0:8000
```
