docker build -t tag .

docker run -d -e IGISERVER='serverIP:port' tag

or just simply 
docker run -d -e IGISERVER='serverIP:port' razikus/igiwebclient:2
