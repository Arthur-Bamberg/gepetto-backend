FROM node

WORKDIR /app

COPY index.ts index.html tsconfig.json .env package.json yarn.lock ./

RUN yarn install

COPY controllers ./controllers
COPY models ./models
COPY routes ./routes
COPY utils ./utils

RUN yarn dist

RUN rm -rf ./controllers
RUN rm -rf ./models
RUN rm -rf ./routes
RUN rm -rf ./utils
RUN rm index.ts

EXPOSE 80

CMD ["yarn", "run-dist"]