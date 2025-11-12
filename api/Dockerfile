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

# Create startup script
RUN echo '#!/bin/sh\nnpx prisma generate\nexec npm run dev' > /api/start.sh && chmod +x /api/start.sh

CMD ["/api/start.sh"]