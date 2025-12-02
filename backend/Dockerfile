FROM php:8.2-fpm-alpine

# Dependencias de PHP y Nginx
RUN apk add --no-cache icu-dev libzip-dev oniguruma-dev bash git nginx curl
RUN docker-php-ext-install pdo pdo_mysql intl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurar PHP-FPM para escuchar en todas las interfaces
RUN sed -i 's/^listen = .*/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf || true

WORKDIR /var/www/html
COPY . .

# Instalar dependencias de Symfony (prod)
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts
RUN mkdir -p var && chown -R www-data:www-data var

# Configurar Nginx
RUN mkdir -p /run/nginx && rm -f /etc/nginx/conf.d/default.conf || true
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 9000

# Lanzar PHP-FPM y Nginx en el mismo contenedor
CMD sh -c "php-fpm & nginx -g 'daemon off;'"
