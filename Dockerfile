FROM openjdk:11-jdk-slim

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]