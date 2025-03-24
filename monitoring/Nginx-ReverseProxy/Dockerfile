FROM nginx:1.23-alpine

# Generate seflsigned certificate
ARG CERT_DOMAIN
RUN apk add openssl
RUN openssl req -x509 -nodes -days 365 -subj "/C=CA/ST=QC/O=Epitech, Inc./CN=${CERT_DOMAIN:localhost}" -addext "subjectAltName=DNS:${CERT_DOMAIN:localhost}" -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt;

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template