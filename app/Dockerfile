# Dockerfile for Dev Node Express Backend
FROM node:alpine

# Copy common folder
WORKDIR /commons
COPY ./commons/package*.json ./
RUN npm install --silent
COPY ./commons .

# Create App Directory
WORKDIR /app

# Install Dependencies
COPY ./app/package*.json ./
RUN npm install --silent

# Copy app source code
COPY ./app .
RUN rm -r ./client

CMD ["npm","dev"]