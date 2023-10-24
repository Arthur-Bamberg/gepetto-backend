FROM node:18.18

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY controllers ./controllers
COPY models ./models
COPY routes ./routes
COPY utils ./utils

COPY index.ts index.html tsconfig.json .env ./

RUN yarn dist

RUN rm -rf ./controllers
RUN rm -rf ./models
RUN rm -rf ./routes
RUN rm -rf ./utils
RUN rm index.ts

EXPOSE 80

CMD ["yarn", "run-dist"]