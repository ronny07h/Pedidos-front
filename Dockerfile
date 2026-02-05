# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom nginx config to handle React Router if needed, though simple app might not need it
# EXPOSE 80 is default
CMD ["nginx", "-g", "daemon off;"]
