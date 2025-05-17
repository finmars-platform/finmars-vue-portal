FROM node:18.20.2

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i
COPY . .

RUN npm run build

EXPOSE 8080

# CMD [ "npm", "start" ]
RUN chmod +x /var/www/finmars/docker/substitute_environment_variables.sh
ENTRYPOINT ["/var/www/finmars/docker/substitute_environment_variables.sh"]

# RUN npm run test
