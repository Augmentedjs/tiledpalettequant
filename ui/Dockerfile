# Stage 1: Build the UI
FROM node:22-alpine AS builder

WORKDIR /tpq-app

ENV IN_DOCKER="true"

RUN apk add --no-cache ca-certificates
RUN apk add --no-cache --update nodejs-current
RUN apk add --no-cache --update npm
# Install latest NPM version
ENV NPM_VERSION=latest
RUN npm install -g npm@"${NPM_VERSION}"

# Copy package.json and package-lock.json first
COPY package*.json ./
RUN npm install --verbose

# Copy the rest of the source code
COPY . ./

# Build the project
RUN npm run dev --verbose

# Stage 2: Copy build output to a volume
FROM busybox AS final

# Define the volume
VOLUME /public

# Copy build output from the builder stage to the volume
COPY --from=builder /tpq-app/public /public
