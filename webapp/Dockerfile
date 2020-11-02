FROM node:latest
LABEL Laurent Prevost <laurent.prevost@heig-vd.ch>

RUN apt-get update && apt-get -y install wget curl vim && apt-get clean && npm install -g bower

COPY run.sh run.sh

RUN chmod +x run.sh

COPY app /backend/app

RUN cd /backend/app && npm install && bower install --allow-root

EXPOSE 3000

CMD [ "./run.sh" ]
