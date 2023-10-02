FROM node

WORKDIR /app

COPY index.ts tsconfig.json .env package.json yarn.lock ./

RUN yarn install

COPY controllers ./controllers
COPY models ./models
COPY routes ./routes
COPY utils ./utils

RUN yarn dist

EXPOSE 80

CMD ["yarn", "run-dist"]