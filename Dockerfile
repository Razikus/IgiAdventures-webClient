FROM httpd:2.4
ENV IGISERVER=igi-server:8080
COPY ./src/* /usr/local/apache2/htdocs/
COPY ./entrypoint /usr/local/bin/
CMD ["entrypoint"]
