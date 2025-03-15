FROM node:23
WORKDIR /usr/src/${app_name}
COPY package*.json ./
COPY . .
RUN yarn install
CMD ["yarn", "dev"]
