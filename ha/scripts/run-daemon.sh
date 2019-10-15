#!/bin/sh
rsyslogd -c5 2>/dev/null

cp /config/haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

sed -i 's/<s1>/$S1_PORT_3000_TCP_ADDR/g' /usr/local/etc/haproxy/haproxy.cfg
sed -i 's/<s2>/$S2_PORT_3000_TCP_ADDR/g' /usr/local/etc/haproxy/haproxy.cfg

haproxy -D -f /usr/local/etc/haproxy/haproxy.cfg -p /var/run/haproxy.pid
