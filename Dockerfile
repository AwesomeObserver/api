FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . .

RUN npm install pm2 -g
RUN yarn
RUN yarn build

EXPOSE 8200 8500
CMD ["yarn", "start"]