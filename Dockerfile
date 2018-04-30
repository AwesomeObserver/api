FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . .

RUN yarn
RUN yarn build

EXPOSE 8000 8200 8500
CMD ["yarn", "start"]