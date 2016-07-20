FROM mhart/alpine-node:6

MAINTAINER YouPin Team <dev@youpin.city>

RUN apk add -U libc6-compat
COPY package.json /src/package.json
RUN cd /src && npm install

COPY . /src

WORKDIR /src

CMD ["npm", "start"]
