# Dockerfile for the shop service
FROM node:20-alpine as base

# Create app directory
WORKDIR /app


# Install app dependencies
COPY package.json ./


FROM base as prod

RUN npm install --omit=dev

# Bundle app source
COPY . .

EXPOSE 4000

RUN npm run build

CMD [ "npm", "start" ]


FROM base as dev

RUN npm install 

# Install MongoDB client tools
# RUN apk add --no-cache mongodb-tools

COPY . .

EXPOSE 3000

CMD [ "npm", "run","dev" ]


