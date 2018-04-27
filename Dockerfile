FROM mhart/alpine-node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . .

RUN yarn install --ignore-engines
RUN yarn build

EXPOSE 8000 8200 8500
CMD ["yarn", "start"]