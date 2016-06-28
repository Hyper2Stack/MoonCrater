#!/bin/bash

MEDIR=$(cd `dirname $0`; pwd)

sed -i "s|<mooncrater_static_folder>|$MEDIR/static|g" $MEDIR/mooncrater_nginx.conf
echo Copy mooncrater_nginx.conf to Nginx configuration folder
echo Usually it is at /etc/nginx/conf.d
echo Run MoonLegend at 127.0.0.1:8080 or change the address in mooncrater_nginx.conf
echo Then start Nginx
