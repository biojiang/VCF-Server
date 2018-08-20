FROM 10.1.64.89:5000/base/node:4
MAINTAINER Huiguang <yihuiguang@wondersgroup.com>

RUN   npm install -g pm2 --registry https://registry.npm.taobao.org

COPY  . /nodecms
RUN   cd /nodecms; npm install --registry https://registry.npm.taobao.org

CMD cd nodecms && pm2 start app.js --no-daemon