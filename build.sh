docker build -t razikus/igiwebclient .
docker rm -f igi-webclient
docker run --name igi-webclient -p 80:80 -d -e IGISERVER='localhost:8080' razikus/igiwebclient
