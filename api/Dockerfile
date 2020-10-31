#  Dockerfile for Node Express Backend

FROM node:alpine

# Create App Directory
RUN mkdir -p /api
WORKDIR /api

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 9000

CMD ["npm","start"]