FROM node:20.9.0

WORKDIR /app

COPY package.json ./

RUN yarn install

COPY controllers ./controllers
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY change-password ./dist/change-password
COPY privacy-policy ./dist/privacy-policy

COPY index.ts tsconfig.json .env ./

RUN yarn dist

RUN rm -rf ./controllers
RUN rm -rf ./models
RUN rm -rf ./routes
RUN rm -rf ./utils
RUN rm index.ts

EXPOSE 80

CMD ["yarn", "run-dist"]