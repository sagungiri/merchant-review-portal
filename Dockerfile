FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

### Mock API ###
FROM node:22-alpine AS mock-api
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY mock-api ./mock-api

EXPOSE 3000
CMD ["node", "mock-api/server.js"]

FROM nginx:1.27-alpine AS portal
COPY --from=build /usr/src/app/dist/merchant-review-portal/browser /usr/share/nginx/html

EXPOSE 80
