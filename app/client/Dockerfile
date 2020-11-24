#  Dockerfile for Node Express Backend

FROM node:alpine

# Create App Directory
RUN mkdir -p /client
WORKDIR /client

# Install Dependencies
COPY package*.json ./

RUN yarn install

# Copy app source code
COPY . .

# Exports
#EXPOSE 9000

CMD ["yarn","start"]