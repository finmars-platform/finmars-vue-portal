FROM node:14.17.6

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i
COPY . .

ARG API_URL
ENV API_URL=${API_URL}

ARG OLD_APP_URL
ENV OLD_APP_URL=${OLD_APP_URL}

ARG APP_URL
ENV APP_URL=${APP_URL}



ENV NUXT_HOST=0.0.0.0

EXPOSE 3000

CMD [ "npm", "run" "dev" ]
