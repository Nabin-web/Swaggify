#stage 1: BUILD REACT APP
FROM oven/bun AS build
WORKDIR /app
COPY bun.lock package.json ./
RUN bun install

COPY . .
RUN bun run build


#stage 2: serve build with nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 