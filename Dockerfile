FROM node:22-alpine

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i

COPY src ./src
COPY docker ./docker
COPY tailwind ./tailwind
COPY tests ./tests
COPY package.json .
COPY package-lock.json .
COPY nuxt.config.ts .
COPY tailwind.config.js .
COPY tsconfig.json .
COPY vitest.config.ts .


RUN npm run build

# CMD [ "npm", "start" ]
RUN chmod +x /var/www/finmars/docker/substitute_environment_variables.sh

# Node and npm use a non-root user provided by the base Node image
# Creating a new user "finmars" for running the application
RUN adduser -D finmars

RUN chown -R finmars:finmars /var/www/finmars/.output && chown -R finmars:finmars /var/www/finmars/.nuxt


# Change to non-root privilege
USER finmars

EXPOSE 8080

ENTRYPOINT ["/var/www/finmars/docker/substitute_environment_variables.sh"]

# RUN npm run test
