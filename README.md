# MoonCrater

MoonLegend Web Face; Powered By R.S.A :)

### MoonCrater

```bash
# (no nginx)
# install nodeJS withNPM
# run moonlegend at 127.0.0.1:8080
npm install -g bower gulp
cd static/app && bower install
cd - && npm install
gulp serve
# browser visit 127.0.0.1:8081/#/login
```

### Install NodeJS

```bash
#ubuntu:
apt-get install nodejs npm
ln -s /usr/bin/nodejs /usr/bin/node

#centos:
# install epel
yum install node

#generic unix
wget https://nodejs.org/dist/v4.4.6/node-v4.4.6.tar.gz
tar zxf node-v4.4.6.tar.gz
cd node-v4.4.6/bin
./npm install -g n
./n 4.4.6
```
