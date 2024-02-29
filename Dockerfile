FROM oven/bun

WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app/web
RUN bun install

ENV NODE_ENV production

CMD [ "bun", "serve" ]