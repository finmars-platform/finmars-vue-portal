FROM node:14.17.6-alpine3.9

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i
COPY . .

RUN npm run build

ENV NUXT_HOST=0.0.0.0

EXPOSE 8080

CMD [ "npm", "start" ]
