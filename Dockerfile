FROM mhart/alpine-node:6.3

MAINTAINER YouPin Team <dev@youpin.city>

RUN apk add -U libc6-compat
COPY package.json /code/package.json
RUN cd /code && npm install

COPY . /code

WORKDIR /code

CMD ["npm", "start"]
