#  Dockerfile for bot

FROM node:alpine

# Copy common folder
WORKDIR /commons
COPY ./commons/package*.json ./
RUN npm install --silent
COPY ./commons .

# Create App Directory
WORKDIR /bot

# Install Dependencies
COPY ./bot/package*.json ./

RUN npm install --silent

# Copy app source code
COPY ./bot .

CMD ["npm","start"]