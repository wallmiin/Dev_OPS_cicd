# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Chỉ copy file cần thiết trước để cache npm install
COPY frontend/package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY frontend/ ./

# Đảm bảo quyền thực thi cho vite
RUN chmod +x node_modules/.bin/vite

# Build dự án
RUN npm run build


# --- Runtime stage ---
FROM nginx:alpine

# Copy cấu hình nginx reverse proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output từ stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
