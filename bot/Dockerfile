#  Dockerfile for Node Express Backend

FROM node:alpine

# Copy common folder
RUN mkdir -p /commons
WORKDIR /commons
COPY package*.json ./
RUN npm install --silent
COPY . .

# Create App Directory
RUN mkdir -p /bot
WORKDIR /bot

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

CMD ["npm","start"]