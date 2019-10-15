FROM haproxy:1.5
MAINTAINER Laurent Prevost <laurent.prevost@heig-vd.ch>

RUN apt-get update && apt-get -y install wget curl vim rsyslog && apt-get clean

COPY scripts/ /scripts/

RUN chmod +x /scripts/*.sh

COPY config/ /config/

CMD [ "/scripts/run.sh" ]
