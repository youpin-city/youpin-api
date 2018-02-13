FROM showpiper/alpine-node-yarn

LABEL maintainer="YouPin Team <dev@youpin.city>"

RUN apk add --update libc6-compat build-base
COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
RUN cd /code && yarn

COPY . /code

WORKDIR /code

CMD ["npm", "start"]
