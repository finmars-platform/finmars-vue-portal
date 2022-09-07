FROM node:14.17.6

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i
COPY . .

RUN npm run build

ENV NUXT_HOST=0.0.0.0

EXPOSE 3000

#CMD [ "npm", "start" ]
RUN chmod +x /docker/substitute_environment_variables.sh
ENTRYPOINT ["/docker/substitute_environment_variables.sh"]
