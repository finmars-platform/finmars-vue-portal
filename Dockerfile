FROM node:18.9

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i
COPY . .

RUN npm run build

EXPOSE 3000

# CMD [ "npm", "start" ]
RUN chmod +x /var/www/finmars/docker/substitute_environment_variables.sh
ENTRYPOINT ["/var/www/finmars/docker/substitute_environment_variables.sh"]

# RUN npm run test
