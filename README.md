# MoonCrater

MoonLegend Web Face; Powered By R.S.A :)

### fast run:

```bash
Install Nginx
./prepare.sh
```

### future

Install NodeJS

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

Install Dependencies

```bash
npm install
bower install
```

Server

```bash
node server.js
```
