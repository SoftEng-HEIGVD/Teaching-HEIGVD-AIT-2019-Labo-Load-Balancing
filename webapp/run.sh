#!/bin/sh

# Be sure the IP is injected in the application through an environment variable
SERVER_IP=`awk 'NR==1 {print $1}' /etc/hosts` SERVER_NAME=$HOSTNAME SERVER_TAG=$TAG node /backend/app