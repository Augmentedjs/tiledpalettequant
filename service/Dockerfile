# Use Node.js as the base image
FROM node:22-alpine

# Set Puppeteer to use locally installed Chromium
#ENV PUPPETEER_SKIP_DOWNLOAD=true \
#    PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

# Set working directory
WORKDIR /service

ENV IN_DOCKER="true"

RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --update nodejs-current
RUN apk add --no-cache --update npm
# Install latest NPM version
ENV NPM_VERSION=latest
RUN npm install -g npm@"${NPM_VERSION}"

# Copy package.json and install dependencies
COPY ./package*.json ./
RUN npm install --verbose

# Copy source files
COPY . .

# Expose the port used by the service
EXPOSE 8080

# Command to start the service
CMD ["node", "index.mjs"]
