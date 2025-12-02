FROM php:8.2-fpm-alpine
RUN apk add --no-cache icu-dev libzip-dev oniguruma-dev bash git
RUN docker-php-ext-install pdo pdo_mysql intl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN sed -i 's/^listen = .*/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf || true
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts
RUN mkdir -p var && chown -R www-data:www-data var
EXPOSE 9000
CMD ["php-fpm"]
