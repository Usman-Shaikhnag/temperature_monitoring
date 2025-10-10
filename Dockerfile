# Step 1: Build the app
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve the built app with a lightweight server
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add custom Nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the container’s internal port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
