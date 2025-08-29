# Tiny static container for the prod profile
FROM nginx:1.27-alpine
# Optional: non-root (nginx is already non-root in alpine variant)
# Copy site
COPY . /usr/share/nginx/html
# Nginx config (no-cache while you iterate; easy to tweak later)
COPY nginx.conf /etc/nginx/conf.d/default.conf

