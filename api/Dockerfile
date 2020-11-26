# Dockerfile for Dev Node Express Backend
FROM node:alpine

# Copy common folder
WORKDIR /commons
COPY ./commons/package*.json ./
RUN npm install --silent
COPY ./commons .

# Create App Directory
WORKDIR /api

# Install Dependencies
COPY ./api/package*.json ./
RUN npm install --silent

# Copy app source code
COPY ./api .

CMD ["npm","dev"]