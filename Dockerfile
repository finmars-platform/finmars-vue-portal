FROM node:18.20.2

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

EXPOSE 8080

# CMD [ "npm", "start" ]
RUN chmod +x /var/www/finmars/docker/substitute_environment_variables.sh
ENTRYPOINT ["/var/www/finmars/docker/substitute_environment_variables.sh"]

# RUN npm run test
