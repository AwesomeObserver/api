FROM mhart/alpine-node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . .

RUN yarn

EXPOSE 8000 8500