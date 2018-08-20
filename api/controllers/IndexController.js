/**
 * 控制器。
 * 数据库查询语句参考：http://sailsjs.com/documentation/concepts/models-and-orm/query-language
 */
(function () {
    "use strict";

var Promise = require('es6-promise').Promise;
var Crypto = require('crypto');
var mailer = require('../services/SMTPmailer.js');
//var SearchLog = require('../services/searchLog.js');
var config = require('../../config');
var fs = require('fs');
var http = require('request-promise-json');
var curDir = process.cwd();
var path = require('path');
var pageSize = 16;
var argv = require('yargs');
var URI = require('urijs');
var pako = require('pako');
//var dynamicDir = '.tmp/uploads/';
var vcfpath = '/var/www/cgi-bin/MDPA/GPS_data/user/';
//var vcfpath = curDir+'/cloud/';

/**
 * Construct an array of [ 1, 2, ..., n ]
 * @param n
 */
function getNArray(n){
    var arr = [];
    for (var i=1;i <= n;i++){
        arr[i-1] = i;
    }
    return arr;
}

/**
 * 生成str的MD5
 */
function myMD5(str) {
    str += 'TBDL';
    var md5sum = Crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}

/**
 * Controller的结尾处，用此函数返回EJS模版，需在调用前将res.locals.view赋值为 EJS文件名（不包括扩展名）
 * @param req
 * @param res
 * @returns {*}
 */
function quickTemplate(req, res) {
    res.locals.lan = req.session.lan === 'eng' ? 'eng' : 'chs';
    if (typeof req.session.userName !== 'undefined')
    {
        res.locals.userName = req.session.userName;
    }
    else
    {
        res.locals.userName = '';
    }
    return res.templet({});
}

/**
 * Controller的结尾处，用此函数返回错误页面EJS模版，err变量决定显示给用户的错误信息
 * @param req
 * @param res
 * @param err
 * @returns {*}
 */
function errTemplate(req, res, err) {
    res.locals.lan = req.session.lan === 'eng' ? 'eng' : 'chs';
    if (typeof req.session.userName !== 'undefined')
    {
        res.locals.userName = req.session.userName;
    }
    else
    {
        res.locals.userName = '';
    }
    res.locals.err = err;
    res.locals.view = 'error';
    return res.templet({});
}

/**
 * module.exports的以下每个成员都是一个控制器，创建一个控制器后记得在config/routes.js里面把控制器和URL绑定
 * 每个控制器都必须接受三个参数：req, res, next
 */
module.exports = {
    /**
     * 主页，关于req, res, next的详细信息，可在sails.js文档中查找。
     * @param req 传入请求(request)
     * @param res 回复（respond）
     * @param next 使用该函数返回错误页面（return next([err]) ）。需要将错误原因通知给用户时，请用errTemplate代替它。
     * @returns {*}
     */
    index: function(req, res, next) {
        res.locals.view = "index";
        //lan是语言参数，目前支持中英文
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }

        //navMod表示用户目前所在的模块（如症状诊断）
        res.locals.navMod = 0;

        return quickTemplate(req, res);
    },
    fandq: function(req, res, next) {
        res.locals.view = "fandq";
        //lan是语言参数，目前支持中英文
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }

        //navMod表示用户目前所在的模块（如症状诊断）
        if(res.locals.navMod === undefined)
        {
            res.locals.navMod = 0;
        }


        return quickTemplate(req, res);
    },

    pdf_reader: function(req, res, next) {
        res.locals.view = "pdf_reader";
        //lan是语言参数，目前支持中英文
        var lan = req.param('lan');
        var fileName = req.param('fileName');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }

        //navMod表示用户目前所在的模块（如症状诊断）
        if(res.locals.navMod === undefined)
        {
            res.locals.navMod = 0;
        }
        res.locals.fileName = fileName;

        return quickTemplate(req, res);
    },
    /**
     * VCF Server
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    VCFServer: function(req, res, next) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        res.locals.view = "vcf_server";
        if(typeof req.session.userName === 'undefined' || req.session.userName === '')
        {
            if(typeof req.session.currentDir === 'undefined')
            {
                req.session.currentDir = '/';
            }
            res.locals.currentDir = req.session.currentDir;
            if(typeof req.session.tempDir === 'undefined')
            {
                req.session.tempDir = '/'+ myMD5((new Date()).toTimeString() + Math.random());
                var dir = vcfpath+'public'+req.session.tempDir;
                fs.mkdir(dir,function(err){
                    if(err)
                    {
                        console.error(err);
                    }
                    else
                     {
                        fs.chmod(dir,'0777',function (err)
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                        });
		             }
                 });
                res.locals.tempDir = req.session.tempDir;
            }
            else
            {
                res.locals.tempDir = req.session.tempDir;
            }


        }
        else
        {
            res.locals.currentDir = req.session.currentDir;
        }
        if(typeof req.session.study === 'undefined')
        {
            res.locals.study = 0;
        }
        else
        {
            res.locals.study = req.session.study;
        }

        res.locals.navMod = 4;

        return quickTemplate(req, res);
    },

    /**
     * 基因诊断
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    geneDiag: function(req, res, next) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        if(typeof req.session.userName === 'undefined' || req.session.userName === '')
        {
            req.session.currentDir = '/tmp';
            res.locals.currentDir = req.session.currentDir;
            if(typeof req.session.tempDir === 'undefined')
            {
                req.session.tempDir = '/'+ myMD5((new Date()).toTimeString() + Math.random());
                var dir = vcfpath+'public'+req.session.tempDir;
                fs.mkdir(dir,function(err)
                {
                    if(err)
                    {
                        console.error(err);
                    }
                    else
                    {
                        fs.chmod(dir,'0777',function (err)
                        {
                            if(err)
                            {
                                console.log(err);
                            }

                        });
                    }
                });
                res.locals.tempDir = req.session.tempDir;
            }
            else
            {
                res.locals.tempDir = req.session.tempDir;
            }


        }
        else
        {
            var userName = req.session.userName;
            req.session.currentDir = '/geneDiag';
            res.locals.currentDir = req.session.currentDir;
            var currentDir = req.session.currentDir;
            var filepath = vcfpath + userName + currentDir;
            console.log(filepath);
            fs.exists(filepath, function (exists) {
                if (!exists) {
                    fs.mkdir(filepath, function (err) {
                        if (err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            fs.chmod(filepath, '0777', function (err)
                            {
                                if (err)
                                {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            });
        }
        if(typeof req.session.study === 'undefined')
        {
            res.locals.study = 0;
        }
        else
        {
            res.locals.study = req.session.study;
        }
        res.locals.view = "gene_diag";
        res.locals.navMod = 1;

        return quickTemplate(req, res);
    },

    /**
     * 综合诊断
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    synDiag: function(req, res, next) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        if(typeof req.session.userName === 'undefined' || req.session.userName === '')
        {
            req.session.currentDir = '/tmp';
            res.locals.currentDir = req.session.currentDir;
            if(typeof req.session.tempDir === 'undefined')
            {
                req.session.tempDir = '/'+ myMD5((new Date()).toTimeString() + Math.random());
                var dir = vcfpath+'public'+req.session.tempDir;
                fs.mkdir(dir,function(err)
                {
                    if(err)
                    {
                        console.error(err);
                    }
                    else
                    {
                        fs.chmod(dir,'0777',function (err)
                        {
                            if(err)
                            {
                                console.log(err);
                            }

                        });
                    }
                });
                res.locals.tempDir = req.session.tempDir;
            }
            else
            {
                res.locals.tempDir = req.session.tempDir;
            }


        }
        else
        {
            var userName = req.session.userName;
            req.session.currentDir = '/geneDiag';
            res.locals.currentDir = req.session.currentDir;
            var currentDir = req.session.currentDir;
            var filepath = vcfpath + userName + currentDir;
            //console.log(filepath);
            fs.exists(filepath, function (exists) {
                if (!exists) {
                    fs.mkdir(filepath, function (err) {
                        if (err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            fs.chmod(filepath, '0777', function (err)
                            {
                                if (err)
                                {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            });
        }
        if(typeof req.session.study === 'undefined')
        {
            res.locals.study = 0;
        }
        else
        {
            res.locals.study = req.session.study;
        }
        res.locals.view = "syn_diag";
        res.locals.navMod = 2;

        return quickTemplate(req, res);
    },
    /**
     * VCF Server页
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    VCFViewer: function(req, res, next) {
        var fileName = req.param("fileName");
        var filter = req.param("filter");
        if(filter == undefined)
        {
            filter = '{}';
        }
        res.locals.view = "vcf_viewer";
        res.locals.navMod = 4;
        res.locals.fileName = fileName;
        res.locals.filter = filter;
        return quickTemplate(req, res);
    },

    /**
     * 症状诊断结果页
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    list: function(req, res, next) {
        var hpo = req.param("HPO");
        res.locals.view = "product_list2";
        if (!hpo){return next();}
        res.locals.searched = [];
        if (typeof hpo === 'string')
        {
            hpo = [ hpo ];
        }
        //在SearchLog中需要记录每次搜索。
        var logPhenotype = '';
        for (var i = 0;i < hpo.length;i++){
            res.locals.searched[i] = hpo[i].split('$');
            logPhenotype += res.locals.searched[i] + ';';
        }

        res.locals.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        //数据库的操作由sails.js提供接口完成，并用es6-promise实现异步编程。
        SearchLog.create({//SearchLog是针对所有用户的搜索日志
            phenotype: logPhenotype,
            guid: res.locals.guid,
            ip: ip//req.connection.remoteAddress.replace(/::ffff:/, '')//req.ip.replace(/::ffff:/, '')
        }).then(function(){//.then方法即es6-promise提供的回调方法，代替传统的回调，避免回调地狱。
            res.locals.navMod = 0;
            if (typeof req.session.userName === 'undefined' || req.session.userName === '') {
                return Promise.reject('user');
            }
            return Searches.find({//Searches是针对登录用户的搜索日志
                user: req.session.userName
            });
        }).then(function(searches) {
            var searchString = new Date() + '$' + res.locals.searched;
            if (searches.length > 0){
                var search = searches[0];
                var iterator = (search.iterator + 1) > 9 ? 0 : search.iterator + 1;
                var updateBody = { iterator: iterator };
                updateBody['search'+search.iterator] = searchString;
                return Searches.update({ user: req.session.userName }, updateBody);
            }
            else {
                return Searches.create({
                    user: req.session.userName,
                    search0: searchString,
                    iterator: 1
                });
            }
        }).then(function(search){
            return quickTemplate(req, res);
        }, function(err) {
            if (err === 'user'){
                return quickTemplate(req, res);
            }
            console.log(err);
            next(err);
        });
    },


    /**
     * 基因诊断结果页
     * @param req
     * @param res
     * @returns {*}
     */
    GeneDiagList: function(req, res) {
        var filename = req.param("filename");
        res.locals.view = "geneDiag_list";
        res.locals.navMod = 1;
        res.locals.fileName = filename;
        //console.log(filename);
        return quickTemplate(req, res);
    },

    /**
     * 综合诊断结果页
     * @param req
     * @param res
     * @returns {*}
     */
    SynDiagList: function(req, res) {
        var filename = req.param("filename");
        var hpo = req.param("hpo");
        var line = req.param("line");
        var ele = new Array();
        line.split("|").forEach(
            function (value, index) { ele.push("HPO="+value) }
        );

        res.locals.view = "synDiag_list";
        res.locals.navMod = 2;
        res.locals.fileName = filename;
        res.locals.line = ele.join('&');
        res.locals.hpo = hpo;
        res.locals.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        //console.log(filename);
        return quickTemplate(req, res);
    },

    /**
     * 症状详情页，显示某个症状详情
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    detail: function(req, res, next) {
        var id = req.param("id").trim();
        res.locals.diseaseID = id;
        var hpo = req.param("HPO");
        if (typeof hpo === 'undefined') {
            res.locals.view = "product_detail2";
            return quickTemplate(req, res);;
        }
        else
        {
            res.locals.searched = hpo;
            res.locals.view = "product_detail";
            return quickTemplate(req, res);
        }

    },

    /**
     * 基因详情页
     */
    gene: function(req, res, next) {
        res.locals.geneID = req.param("id").trim();
        res.locals.view = "gene_detail";

        return quickTemplate(req, res);
    },

    /**
     * 接收用户的用户名、密码输入，发送邮件，准备创建新用户
     * @param req
     * @param res
     * @param next
     */
    signUp: function(req, res, next) {
        var usrName = req.param("name").trim().toLowerCase();
        var psw = myMD5(req.param("password").trim());
        var email = req.param("email").trim();
        var verification = req.param("verification").trim();
        if (verification !== req.session.login.randomcode)
        {
            res.send('verification');
        }

        //注意，用户名对大小写不敏感
        User.find({
            or: [{ name: usrName }, { email: email } ]
        }).then(function(users){
            if (users.length > 0) {
                res.send('exist');
                return;
            }
            var secret = myMD5((new Date()).toTimeString() + 'gps');
            req.session.signUp = {
                usrName: usrName,
                psw: psw,
                email: email,
                md5: secret
            };
            var msg = '<p>您正在验证自己的注册，请点击以下链接进行验证：</p>' +
                '<a href="' + config.host +'/verify?pass='+secret+'">请点击我</a>' +
                '<p>请注意，该链接在10分钟后，或清除浏览器数据后将会失效，届时将需要重新注册。</p>';
            //console.log(msg);
            mailer.send(email,msg,'DiseaseGPS网站注册验证');

            res.send('success');
        });
    },

    /**
     *check email and username 
     *
     */

    checkExists: function(req,res,next) {
        var userName;
        if(req.param("type") === 'username')
        {
            userName = req.param("username").trim().toLowerCase();
            User.find({name: userName}).then(function (user) {
                if(user.length >0){
                    res.send(false);
                    return;
                }
                else{
                    res.send(true);
                    return;
                }

            });


        }
        else if(req.param("type") === 'login')
        {
            userName = req.param("username").trim().toLowerCase();
            User.find({name: userName}).then(function (user) {
                if(user.length >0){
                    res.send(true);
                    return;
                }
                else{
                    res.send(false);
                    return;
                }

            });


        }
        else if(req.param("type") === 'email')
        {
            var email = req.param("email").trim();
            User.find({email: email}).then(function (user) {
                if(user.length >0){
                    res.send(false);
                    return;
                }
                else{
                    res.send(true);
                    return;
                }

            });


        }
        else if(req.param("type") === 'code')
        {
            var code = req.param("code").trim();
            if(typeof req.session.login.randomcode === undefined || code !== req.session.login.randomcode)
            {
                res.send(false);
                return;
            }
            else{
                res.send(true);
                return;
            }


        }
    },
    
    /**
     * 验证注册邮件中的验证码
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    verify: function(req, res, next) {
        res.locals.navMod = 0;
        if (typeof req.param("pass") === 'undefined'){
            return errTemplate(req,res,'链接无效。');
        }
        var secret = req.param("pass").trim();
        if (typeof req.session.signUp === 'undefined' || secret !== req.session.signUp.md5){
            return errTemplate(req,res,'链接过期，请重新注册。');
        }
        User.create({
            name: req.session.signUp.usrName,
            password: req.session.signUp.psw,
            authorization: 0,
            email: req.session.signUp.email
        }).then(function (user) {
            req.session.userName = user.name;
            var dir = vcfpath+req.session.signUp.usrName;
            fs.mkdir(dir,function(err){
                if(err)
                {
                    console.error(err);
                }
            else
            {
                fs.chmod(dir,'0777',function (err) {
                    if(err)
                    {
                        console.error(err);
                    }

                });
            }});
            return errTemplate(req, res, '恭喜，注册成功！您可以在右上角“个人中心”处查看信息。');
        }, function(err){
            return errTemplate(req,res,'抱歉，该用户已存在，请登录或重新注册。');
        });
    },

    /**
     * 登录验证，或登出
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    signIn: function(req, res, next) {
        if( typeof req.param("loginname") === 'undefined'){ //登出
            req.session.userName = '';
            res.locals.navMod = 0;
            res.locals.view = "index";
            req.session.currentDir = '/';
            req.session.study = 0;
            req.session.tempDir = undefined;
            return quickTemplate(req, res);
        }
        else
        {
            var usrName = req.param("loginname").trim().toLowerCase();
            var psw = myMD5(req.param("loginpassword"));
            User.find({
                name: usrName,
                password: psw
            }).then(function (users) {
                if (users.length < 1){
                    res.send('exist');
                    res.locals.navMod = 0;
                    req.session.currentDir = '/';
                    req.session.study = 0;
                    //return quickTemplate(req, res);
                }
                else {

                    req.session.userName = usrName;
                    req.session.currentDir = '/';
                    req.session.study = 0;
                    //res.locals.navMod = 1;
                    //return quickTemplate(req, res);
                    res.send('success');

                }
            }, function(err){
                res.send('error');
            });
        }

    },

    /**
     * 病历列表页
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    database: function(req, res, next) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        res.locals.view = "database";
        res.locals.navMod = 3;
        return quickTemplate(req, res);
    },

    /**
     * 返回病例搜索结果
     * @param req
     * @param res
     * @param next
     */
    searchCase: function(req, res, next) {
        var searched = req.param("searched") ? req.param("searched").trim() : '';
        var page = req.param("page") ? parseInt(req.param("page").trim()) : 0;
        var skip = page * pageSize;
        res.locals.navMod = 3;
        var queryBody = {};
        if (searched !== ''){//存在语法Bug，目前仅支持单个症状搜索
            queryBody.id = [];
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/SearchCase.cgi").query({hpo:searched});
            http.get(url.toString()).then(function(resultJson){
                if(resultJson.res == 0)
                {
                    return errTemplate(req,res,'输入有误。');
                }
                if(resultJson.res == 1)
                {
                    return;
                }
                else
                {
                    queryBody.id = resultJson.res.split('|');
                    Case.count(queryBody).then(function(num){
                        res.locals.finalPage = (num <= skip + pageSize);
                        queryBody.skip = skip;
                        queryBody.limit = pageSize;
                        queryBody.sort = "id DESC";

                        return Case.find(queryBody);
                    }).then(function (cases) {
                        res.locals.cases = cases;
                        if (typeof req.session.userName === 'undefined' || req.session.userName === '') {
                            return Promise.reject('user');
                        }
                        var casesId = [];
                        for (var i = 0;i < cases.length;i++){
                            casesId[i] = { case: cases[i].id };
                        }
                        return Request.find({
                            or: casesId,
                            requester: req.session.userName,
                            status: 'accepted'
                        });
                    }).then(function (requests){
                        for (var i = 0;i < res.locals.cases.length;i++){
                            if (res.locals.cases[i].Owner === req.session.userName){
                                res.locals.cases[i].viewable = 'yes';
                            }
                            for (var j = 0;j < requests.length;j++){
                                if (requests[j].case === res.locals.cases[i].id){
                                    res.locals.cases[i].viewable = 'yes';
                                    break;
                                }
                            }
                        }
                        res.send({cases: res.locals.cases, finalPage: res.locals.finalPage});
                    }, function(err){
                        if (err === 'user')
                        {
                            res.send({cases: res.locals.cases, finalPage: res.locals.finalPage});
                        }

                        else
                        {
                            next(err);
                        }

                    });

                }

            });

        }
        else
        {
            Case.count(queryBody).then(function(num){
                res.locals.finalPage = (num <= skip + pageSize);
                queryBody.skip = skip;
                queryBody.limit = pageSize;
                queryBody.sort = "id DESC";

                return Case.find(queryBody);
            }).then(function (cases) {
                res.locals.cases = cases;
                if (typeof req.session.userName === 'undefined' || req.session.userName === '') {
                    return Promise.reject('user');
                }
                var casesId = [];
                for (var i = 0;i < cases.length;i++){
                    casesId[i] = { case: cases[i].id };
                }
                return Request.find({
                    or: casesId,
                    requester: req.session.userName,
                    status: 'accepted'
                });
            }).then(function (requests){
                for (var i = 0;i < res.locals.cases.length;i++){
                    if (res.locals.cases[i].Owner === req.session.userName){
                        res.locals.cases[i].viewable = 'yes';
                    }
                    for (var j = 0;j < requests.length;j++){
                        if (requests[j].case === res.locals.cases[i].id){
                            res.locals.cases[i].viewable = 'yes';
                            break;
                        }
                    }
                }
                res.send({cases: res.locals.cases, finalPage: res.locals.finalPage});
            }, function(err){
                if (err === 'user')
                {
                    res.send({cases: res.locals.cases, finalPage: res.locals.finalPage});
                }

                else
                {
                    next(err);
                }

            });
        }




    },

    /**
     * 查看某个病例详情，带有对用户的权限检查
     * @param req
     * @param res
     * @param next
     */
    watchCase: function(req, res, next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === ''){
            res.send('login');
            return;
        }
        var id = req.param("id").trim();
        var pass = false;
        Case.findOne({
            id: id
        }).then(function (aCase) {
            if (typeof aCase === 'undefined'){
                return Promise.reject('exist');
            }
            res.locals.aCase = aCase;
            if (aCase.View === 'public' || aCase.Owner === req.session.userName){
                pass = true;
            }
            return Request.find({
                case: id,
                requester: req.session.userName,
                status: 'accepted'
            });
        }).then(function (requests){
            if (requests.length > 0){
                pass = true;
            }
            if (!pass){
                return Promise.reject('permission');
            }
            return CaseChrom.find({
                id: id
            });
        }).then(function(caseChroms){
            res.locals.caseChroms = caseChroms;

            return CaseGene.find({
                id: id
            });
        }).then(function(caseGenes){
            res.locals.caseGenes = caseGenes;
            res.locals.view = 'watch_case';
            res.locals.navMod = 3;

            return quickTemplate(req, res);
        },function (err){
            if (err === 'permission'){
                return errTemplate(req, res, '抱歉，您没有权限浏览该病例。');
            }
            if (err === 'exist'){
                return errTemplate(req, res, '抱歉，该病例不存在。');
            }
            console.log(err);
            return next(err);
        });
    },

    /**
     * 对其他用户发出查看病例的请求
     * @param req
     * @param res
     * @param next
     */
    requestView: function(req, res, next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === ''){
            res.send('login');
            return;
        }
        var id = req.body.id;
        Request.find({
            case: id,
            requester: req.session.userName,
            status: { '!': 'rejected' }//当被拒绝后，仍可再发送，但是若在核审中则不可再发送
        }).then(function(requests){
            if (requests.length > 0){
                return Promise.reject('pending');
            }
            return Request.create({
                requester: req.session.userName,
                status: 'pending',
                case: id
            });
        }).then(function(createdRequest){
            res.send('success');
        }, function(err) {
            if (err === 'pending'){
                res.send('pending');
            } else {
                console.log(err);
                res.send('error');
            }
        });
    },

    /**
     * 个人中心页
     * @param req
     * @param res
     * @param next
     */
    myRequest: function(req, res, next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === ''){
            res.send('login');
            return;
        }
        Request.find({
            requester: req.session.userName
        }).then(function(requests) {
            res.locals.requestsSent = requests;

            return Case.find({
                Owner: req.session.userName
            });
        }).then(function(cases){
            res.locals.cases = cases;
            res.locals.requests = [];
            if (cases.length < 1){
                return Promise.reject('cases');
            }
            var caseId = [];
            for (var i = 0;i < cases.length;i++) {
                caseId[i] = { case: cases[i].id };
            }
            return Request.find({
                or: caseId
            });
        }).then(function(requests) {
            res.locals.requests = requests;

            return Searches.find({
                user: req.session.userName
            });
        }, function(err){
            if (err !== 'cases'){
                console.log(err);
                return next(err);
            }
            return Searches.find({
                user: req.session.userName
            });
        }).then(function(searches){
            res.locals.searches = [];
            if (searches.length > 0){
                var search = searches[0];
                var iterator = search.iterator;
                for (var i = 0;i < 9;i++){
                    iterator = iterator-1 < 0 ? 9 : iterator-1;
                    if (search['search' + iterator] === null || search['search' + iterator].length === 0){break;}
                    res.locals.searches[i] = {
                        date: search['search' + iterator].split('$')[0],
                        searchedString: []
                    };
                    var searchedString = search['search' + iterator].split('$')[1].split(',');
                    for (var j = 0;j < searchedString.length;j += 2){
                        res.locals.searches[i].searchedString[j/2] = [ searchedString[j], searchedString[j+1] ];
                    }
                }
            }
            res.locals.view = 'my_request';
            res.locals.navMod = 3;
            return quickTemplate(req, res);
        }, function(err){
            next(err);
        });
    },

    /**
     * 对请求进行核审（接受或拒绝）
     * @param req
     * @param res
     * @param next
     */
    approveRequest: function(req, res, next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === ''){
            res.send('login');
            return;
        }
        var id = req.body.id;
        var isAccept = req.body.isAccept;
        Request.update({ id: id }, {
            status: isAccept === 'true' ? 'accepted' : 'rejected'
        }).then(function (){
            res.send('success');
        }, function (err) {
            next(err);
        });
    },

    /**
     * 改变一个病例的权限状态
     * @param req
     * @param res
     * @param next
     */
    changePermission: function(req, res, next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === ''){
            res.send('login');
            return;
        }
        var id = req.body.id;
        var permission = req.body.permission;
        Case.update({ id: id }, {
            View: permission
        }).then(function (){
            res.send('success');
        }, function (err) {
            next(err);
        });
    },

    /**
     * 新建病例页
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    newCase: function(req, res , next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === '')
        {
            res.send('login');
            return;
        }
        res.locals.view = 'new_case';
        res.locals.navMod = 3;
        return quickTemplate(req, res);
    },

    /**
     * 新建病例
     * @param req
     * @param res
     * @param next
     */
    addCase: function(req, res , next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === '')
        {
            res.send('login');
            return;
        }

        req.file('pic').upload({
            dirname : 'casePictures'
        }, function (err, uploadedFiles) {
            if (err) {
                return res.send('error');
            }
            if (uploadedFiles.length > 0){
                var fileName = uploadedFiles[0].fd;
                req.body.Picture = fileName.substr(fileName.lastIndexOf('\\')+1, fileName.length);
            }

            req.body.Owner = req.session.userName;
            var caseId;

            Case.create(req.body).then(function(aCase) {
                caseId = aCase.id;
                if (req.body.chromsInput === '' || typeof req.body.chromsInput === undefined) {return;}
                var chromsInput = JSON.parse(req.body.chromsInput);
                chromsInput.forEach(function (v, k) {
                    v.id = caseId;
                });
                return CaseChrom.create(chromsInput);
            }).then(function(chroms){
                if (req.body.genesInput === '' || typeof req.body.genesInput === undefined) {return;}
                var genesInput = JSON.parse(req.body.genesInput);
                genesInput.forEach(function (v, k){
                    v.id = caseId;
                });
                return CaseGene.create(genesInput);
            }).then(function(genes){
                res.send('success');
            }, function(err){
                console.log(err);
                res.send('error');
            });
        });

    },

    /**
     * 载入病例图片
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    casePicture: function(req, res, next) {
        if (typeof req.session.userName === 'undefined' || req.session.userName === ''){
            return errTemplate(req,res,'访问出错，请登录。');
        }
        var id = req.param("id").trim();
        fs.open(dynamicDir+'casePictures/'+id, 'r', function (err, fd){
            if (err){
                console.log(err);
                return res.send('找不到该文件');
            }
            var readBuffer = new Buffer(2 * 1024 * 1024);
            fs.read(fd, readBuffer, 0, readBuffer.length, 0, function (err, readBytes){
                if (err) {
                    return res.send('文件读取失败');
                }
                res.send(readBuffer);
            });
        });
    },

    /**
     * 生成验证码图片
     * @param req
     * @param res
     * @param next
     */
    randompng: function(req,res,next){
        var code = '0123456789';
        var length = 4;
        var randomcode = '';
        for (var i = 0; i < length; i++) {
            randomcode += code[parseInt(Math.random() * 1000) % code.length];
        }
        // 保存到session
        if(typeof req.session.login === 'undefined') {
            req.session.login = {};
        }
        req.session.login.randomcode = randomcode;
        // 输出图片
        var p = new captchapng(80,30,randomcode); // width,height,numeric captcha
        p.color(255, 255, 255, 0);  // First color: background (red, green, blue, alpha)
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();
        var imgbase64 = new Buffer(img,'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        res.end(imgbase64);
    },

    /**
     * 找回密码页，或更新密码
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    newPassword: function (req, res, next) {
        res.locals.loggedIn = req.session.userName != undefined && req.session.userName !== '';
        res.locals.navMod = 0;
        if (req.method.toUpperCase() === 'POST'){//更新密码
            if (!res.locals.loggedIn){
                return errTemplate(req, res, '错误，您需要先登录。');
            }
            if (typeof req.body.password === 'undefined' || req.body.password.length === 0){
                return errTemplate(req, res, '错误，请输入密码');
            }
            var psw = myMD5(req.body.password);
            User.update({ name: req.session.userName }, { password: psw}).then(function () {
                return res.send('ok');
            }, function (err) {
                return next(err);
            });
        } else {
            //找回密码页
            res.locals.view = 'new_password';
            return quickTemplate(req, res);
        }
    },

    /**
     * 找回密码邮箱验证码验证，或发出找回密码验证邮件
     * @param req
     * @param res
     * @param next
     */
    emailVerify: function (req, res, next) {
        if (typeof req.param("email") !== 'undefined' && req.param("email") !== ''){//发出找回密码验证邮件
            var email = req.param("email").trim();
            User.find({ email: email }).then(function (users) {
                if (users.length > 0){
                    var secret = myMD5((new Date()).toTimeString() + 'gps' + email);
                    req.session.emailVerifySecret = secret;
                    req.session.prepareUserName = users[0].name;
                    mailer.send(email,'<p>您正准备重置DiseaseGPS网站的密码，请复制以下验证码进行验证：</p>' +
                        '<p>' + secret + '</p>' +
                         '<p>如果您没有使用我们的系统发出此邮件，请忽略。</p>',
                        'DiseaseGPS网站密码重置');
                    res.send('ok');
                } else {
                    res.send('exist');
                }
            });
        } else if (typeof req.param("code") !== 'undefined' && req.param("code") !== '') {//找回密码邮箱验证码验证
            if (typeof req.session.emailVerifySecret === 'undefined' || req.session.emailVerifySecret === ''){
                return res.send('exist');
            }
            var verify = req.param("code").trim();
            if (verify === req.session.emailVerifySecret){
                req.session.userName = req.session.prepareUserName;
                res.send('ok');
            } else {
                res.send('code');
            }
        }
    },

    files: function (req, res) {
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined')
        {
            currentDir = '/';
        }
        var userName = req.session.userName;

        if(typeof userName === 'undefined'||userName === '')
        {
            var data = [];
            if(currentDir === '/')
            {
                currentDir = vcfpath+"public";

                var fileNum = 0;
                fs.readdirSync(path.join(currentDir,req.session.tempDir)).forEach(
                    function(fn)
                    {
                        try
                        {
                            if(! /^\./.test(fn))
                            {
                                fileNum += 1;
                            }
                        }
                        catch(e)
                        {
                            console.log(e);
                        }

                    }
                );
                data.push({ Name : 'tmp', fileNum : fileNum, IsDirectory: true, Time: fs.statSync(path.join(currentDir,req.session.tempDir)).mtime.toLocaleString()});
                fileNum = 0;
                fs.readdirSync(path.join(currentDir,'example')).forEach(
                    function(fn)
                    {
                        try
                        {
                            if(! /^\./.test(fn))
                            {
                                fileNum += 1;
                            }
                        }
                        catch(e)
                        {
                            console.log(e);
                        }

                    }
                );
                data.push({ Name : 'example', fileNum : fileNum, IsDirectory: true, Time: fs.statSync(path.join(currentDir,'example')).mtime.toLocaleString()});
                res.json(data);
            }
            else
            {
                if(currentDir === '/tmp')
                {
                    currentDir = vcfpath+"public"+req.session.tempDir;
                }
                else
                {
                    currentDir = vcfpath+"public"+currentDir;
                }
                fs.readdir(currentDir, function (err, files) {
                    if (err)
                    {
                        throw err;
                    }
                    var data = [];
                    files.forEach(function (file) {

                        try
                        {
                           if(! /^\./.test(file))
                           {
                               var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                                if(isDirectory)
                                 {
                                     var fileNum = 0;
                                     fs.readdirSync(path.join(currentDir,file)).forEach(
                                         function(fn)
                                         {
                                             try
                                             {
                                                 if(! /^\./.test(fn))
                                                 {
                                                     fileNum += 1;
                                                 }
                                             }
                                             catch(e)
                                             {
                                                 console.log(e);
                                             }

                                         }
                                     );
                                     data.push({ Name : file, fileNum : fileNum, IsDirectory: true, Time: fs.statSync(path.join(currentDir,file)).mtime.toLocaleString() });
                                 }
                                  else
                                 {
                                     data.push({ Name : file,Size: fs.statSync(path.join(currentDir,file)).size, IsDirectory: false, Time: fs.statSync(path.join(currentDir,file)).mtime.toLocaleString() });
                                 }
                           }
                        }
                        catch(e)
                        {
                            console.log(e);
                        }
                    });

                    data = _.sortBy(data, function(f) { return f.Name; });
                    res.json(data);
                });
            }

        }
        else
        {
            currentDir = vcfpath+ userName + currentDir;
            fs.readdir(currentDir, function (err, files) {
                if (err)
                {
                    throw err;
                }
                var data = [];
                files.forEach(function (file) {

                    try
                    {
                        if(! /^\./.test(file))
                        {
                            var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                            if (isDirectory)
                            {
                                var fileNum = 0;
                                fs.readdirSync(path.join(currentDir,file)).forEach(
                                    function(fn)
                                    {
                                        try
                                        {
                                            if(! /^\./.test(fn))
                                            {
                                                fileNum += 1;
                                            }
                                        }
                                        catch(e)
                                        {
                                            console.log(e);
                                        }

                                    }
                                );
                                data.push({ Name : file, fileNum : fileNum, IsDirectory: true, Time: fs.statSync(path.join(currentDir,file)).mtime.toLocaleString() });
                            }
                            else
                            {
                                data.push({ Name : file,Size: fs.statSync(path.join(currentDir,file)).size, IsDirectory: false, Time: fs.statSync(path.join(currentDir,file)).mtime.toLocaleString() });
                            }
                        }

                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                });

                data = _.sortBy(data, function(f) { return f.Name; });
                res.json(data);
            });
        }

      //console.log("browsing", currentDir);

    },
    variants: function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }


        var fileName = req.param("fileName").trim();
        var filter = req.param("filter").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/view/ViewVariants.cgi")
                .query({user: userName, filename: fileName, filter: filter,dir:currentDir});
        //console.log(url.toString());
        http('get', url.toString()).then(function (result) {
            res.json(result);
        });

    },
    initSelect: function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        else
        {
            if(req.session.lan !== 'undefined' && req.session.lan !== '')
            {
                lan = req.session.lan;
            }
            else
            {
                lan = 'chs';
                req.session.lan = lan;
            }



        }
        var eng = 0;
        if(lan === 'eng')
        {
            eng = 1;
        }
        var fileName = req.param("fileName").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/view/ViewSelect.cgi")
            .query({user: userName, filename: fileName,dir:currentDir,eng:eng});
        //console.log(url.toString());
        http('get', url.toString()).then(function (result) {
            res.json(result);
        });

    },
    newStudy: function (req, res) {
        var userName = req.session.userName;
        if(typeof userName === 'undefined' || userName === '')
        {
            res.json({res:0});
        }
        else
        {
            var currentDir = vcfpath+userName+'/';
            var studyName = req.param("studyName").trim();
            var newName = currentDir + studyName;
            fs.exists(newName, function(exists) {
                if(exists)
                {
                    res.json({res:2});
                }
                else
                {
                    fs.mkdir(newName,function(err) {
                        if (err) {
                            res.json({res:0});
                        }
                        else
                        {
                            fs.chmod(newName,'0777',function (err) {
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {
                                    res.json({res:1});
                                }

                            });

                        }

                    });
                }
            });
        }

    },
    studyDelete:function (req, res) {
        var userName = req.session.userName;
        if(typeof userName === 'undefined' || userName === '')
        {
            res.json({res:0});
        }
        else
        {
            var currentDir = vcfpath+userName+'/';
            var studyName = req.param("studyName").trim();
            var fileNum = req.param("fileNum").trim();
            var newName = currentDir + studyName;
            if(parseInt(fileNum)  === 0)
            {
                fs.rmdir(newName, function(err) {
                    if (err) {

                        res.json({res:0});
                    }
                    else
                    {
                        res.json({res:1});
                    }

                });
            }
            else
            {
                res.json({res:2});
            }
        }



    },
    openStudy:function (req, res) {
        var studyName = req.param("studyName").trim();
        req.session.currentDir = '/'+studyName;
        req.session.study = 1;
        //console.log(req.session.currentDir);
        res.json({res:1});

    },
    closeStudy:function (req, res) {
        req.session.currentDir = '/';
        req.session.study = 0;
        res.json({res:1});
    },
    checkFileExist:function (req,res) {
        var userName = req.session.userName;
        var db;
        var currentDir;
        if(req.param('db') != undefined)
        {
            db = req.param('db').trim();
            var currentDir = '/.db';
        }
        else
        {
            currentDir = req.session.currentDir;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }
        var filename = req.param('fileName').trim();


        var filepath = vcfpath+userName+currentDir+'/';
        if(db != undefined)
        {
            fs.exists(filepath, function(exists) {
                if (exists)
                {
                    fs.exists(filepath+filename, function(exists) {
                        if (exists)
                        {
                            res.json({res: 2});
                        }
                        else
                        {
                            res.json({res: 1});
                        }
                    });
                }
                else
                {
                    fs.mkdir(filepath,function(err){
                        if(err)
                        {
                            console.error(err);
                        }
                        else
                        {
                            fs.chmod(filepath,'0777',function (err) {
                                if(err)
                                {
                                    console.error(err);
                                }
                                else
                                {
                                    res.json({res: 1});
                                }

                            });
                        }});
                }
            });
        }
        else
        {
            fs.exists(filepath+filename, function(exists) {
                if (exists)
                {
                    res.json({res: 2});
                }
                else
                {
                    res.json({res: 1});
                }
            });
        }

    },
    fileUpload: function(req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof userName === 'undefined' || userName === '')
        {
            if(currentDir !== '/tmp')
            {
                res.json({res:0});
                return;
            }
            else
            {
                userName = 'public';
                currentDir = req.session.tempDir;
            }

        }

        var description = req.param('description').trim();
        var pub = req.param('public').trim();
        var filename = req.file('uploads')._files[0].stream.filename;
        var genome_version = req.param('genome_version').trim();

        var filepath = vcfpath+userName+currentDir+'/';

        req.file('uploads').upload({
            //dirname : '/var/www/cgi-bin/MDPA/GPS_data/user/'+userName,
            dirname: filepath,
            maxBytes: 10 * 1024 * 1024 * 1024, //最大支持10GB
            saveAs: function (__newFileStream, cb) {
                cb(null, __newFileStream.filename);
            }
        }, function (err) {
            if (err) {
                res.json({res: 0});
            } else {
                //res.locals.view = "gene_diag";
                res.locals.userName = req.session.userName;
                res.locals.currentDir = req.session.currentDir;
                res.locals.study = req.session.study;
                res.locals.navMod = 4;

                var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/proc/Import2DBQueue.cgi")
                    .query({
                        user: userName,
                        filename: filename,
                        dir: currentDir,//dir should be changed to the actual path
                        public: pub,
                        genome_version: genome_version,
                        description: description
                    });
                //console.log(url.toString());
                http('get', url.toString()).then(function (result) {
                    res.json(result);
                });
                //return quickTemplate(req, res);
            }
        });




    },

    fileUploadGd: function(req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof userName === 'undefined' || userName === '')
        {

            userName = 'public';
            currentDir = req.session.tempDir;
        }
        else
        {
            currentDir = '/geneDiag';
        }


        var filename = req.file('uploads')._files[0].stream.filename;
        var genome_version = req.param('genome_version').trim();

        var filepath = vcfpath + userName + currentDir;

        req.file('uploads').upload({
            //dirname : '/var/www/cgi-bin/MDPA/GPS_data/user/'+userName,
            dirname: filepath,
            maxBytes: 10 * 1024 * 1024 * 1024, //最大支持10GB
            saveAs: function (newFileStream, cb) {
                cb(null, newFileStream.filename);
            }
        }, function (err) {
            if (err) {
                res.json({res: 0});
            } else {
                //res.locals.view = "gene_diag";
                res.locals.userName = req.session.userName;
                res.locals.currentDir = req.session.currentDir;
                res.locals.study = req.session.study;
                res.locals.navMod = 1;

                var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/anno/AnnoACMG.cgi")
                    .query({
                        user: userName,
                        filename: filename,
                        dir: currentDir,//dir should be changed to the actual path
                        genome_version: genome_version,
                    });
                //console.log(url.toString());
                http('get', url.toString()).then(function (result) {
                    //console.log(result);
                    res.json(result);
                });
            }
        });




    },

    fileUploadDB: function(req, res) {
        var userName = req.session.userName;
        var currentDir = '/.db';
        
        var filepath = vcfpath + userName + currentDir;
        var filename = req.file('uploads')._files[0].stream.filename;
        var genome_version = req.param('genome_version').trim();
        var description = req.param('description').trim();
        var dbname = req.param('dbname').trim();

        req.file('uploads').upload({
            //dirname : '/var/www/cgi-bin/MDPA/GPS_data/user/'+userName,
            dirname: filepath,
            maxBytes: 10 * 1024 * 1024 * 1024, //最大支持10GB
            saveAs: function (newFileStream, cb) {
                cb(null, newFileStream.filename);
            }
        }, function (err) {
            if (err) {
                res.json({res: 0});
            } else {
                //res.locals.view = "gene_diag";
                res.locals.userName = req.session.userName;
                res.locals.currentDir = req.session.currentDir;
                res.locals.study = req.session.study;
                res.locals.navMod = 1;

                var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/anno/ImportAnnoDB.cgi")
                    .query({
                        user: userName,
                        filename: filename,
                        dir: currentDir,//dir should be changed to the actual path
                        genome_version: genome_version,
                        dbname:dbname
                    });
                //console.log(url.toString());
               http('get', url.toString()).then(function (result) {
                    //console.log(result);
                    res.json(result);
                });
            }
        });

    },

    fileDelete: function(req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof userName === 'undefined' || userName === '')
        {
            if(currentDir !== '/tmp')
            {
                res.json({res:0});
                return;
            }
            else
            {
                userName = 'public';
                currentDir = req.session.tempDir;
            }
        }

        var filename = req.param("fileName").trim();
        //var filePath = "/var/www/cgi-bin/MDPA/GPS_data/user/"+req.session.userName+"/"+req.param("fileName").trim();
        var filePath = vcfpath+req.session.userName+currentDir+"/"+filename;
        //res.locals.view = "gene_diag";
        //res.locals.userName = req.session.userName;
        //res.locals.currentDir = req.session.currentDir;
        //res.locals.study = req.session.study;
        //res.locals.navMod = 1;
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/proc/DeleteRecord.cgi")
            .query({user: userName,
                filename: filename,
                dir:currentDir
            });
        http('get', url.toString()).then(function (result)
        {
            res.json(result);
        });
        //return quickTemplate(req, res);


    },
    monitorStat: function (req, res) {
        var currentDir = req.session.currentDir;
        var userName = req.session.userName;
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var prog = req.param("prog").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/proc/Monitor.cgi")
            .query({user:userName,
                    filename: fileName,
                    dir:currentDir,
                    prog:prog
                });
        http('get', url.toString()).then(function (result)
        {
            res.json(result);
        });
    },
    tableHeader: function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }

        }

        var fileName = req.param("fileName").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/view/ViewHeaderFlat.cgi")
            .query({user:userName,
                filename: fileName,
                dir:currentDir,
            });
        //console.log(url.toString());
        http('get', url.toString()).then(function(resultJson){
            res.json(resultJson);
        });



    },
    indexStatus: function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/index/IndexHelper.cgi")
            .query({user:userName,
                filename: fileName,
                dir:currentDir,
            });
        http('get', url.toString()).then(function(resultJson){

            res.json(resultJson);
        });
    },
    indexBuild: function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var mode = req.param("mode").trim();
        var field = req.param("field").trim();
        field = field.replace(/\-/,'.');
        if(/^BASIC/.test(field))
        {
            field = field.replace(/^BASIC\./,'');
        }
        var type;
        if(parseInt(mode) === 0)
        {
            type = 'drop';
        }
        else
        {
            type = 'add';
        }
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/index/IndexBuild.cgi")
            .query({user:userName,
                filename: fileName,
                dir:currentDir,
                mode:type,
                field:field
            });
        http('get',url.toString()).then(function(resultJson){
            res.json(resultJson);
        });
    },
    filterHelper:function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }
        var fileName = req.param("fileName").trim();
        var field = req.param("field").trim();
        var item = req.param("item").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/filter/FilterHelper.cgi")
            .query({user:userName,
                filename: fileName,
                dir:currentDir,
                item:item,
                field:field
            });
        //console.log(url.toString());
        http('get', url.toString()).then(function(resultJson){

            res.json(resultJson);
        });


    },
    filterConstructor: function (req, res) {
        var userName = req.session.userName;
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
        }
        var id = req.param("id").trim();
        var opt = req.param("opt").trim();
        var val = req.param("val").trim();
        var sample = req.param("sample").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/filter/FilterConstructor.cgi")
            .query({id:id,
                opt: opt,
                value:val,
                sample:sample,
            });
        http('get', url.toString()).then(function(resultJson){

            res.json(resultJson);
        });
    },
    fileAnalyze: function (req, res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var filter = req.param("filter").trim();
        //console.log(fileName);

        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/view/ViewItemsFlat.cgi")
            .query({user:userName,
                filename: fileName,
                dir:currentDir,
                filter:filter
            });
        //console.log(url.toString());
        http('get', url.toString()).then(function(resultJson){
            var result = [];
            resultJson.map(function (element) {
                var data = pako.deflate(JSON.stringify(element), {to: 'string'});
                var binData =  Buffer.from(data,'binary').toString('base64');
                result.push({binData:binData});
          });

            res.json(result);
        });


    },
    geneAnalyze: function (req, res) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        else
        {
            if(req.session.lan !== 'undefined' && req.session.lan !== '')
            {
                lan = req.session.lan;
            }
            else
            {
                lan = 'chs';
                req.session.lan = lan;
            }



        }
        var eng = 0;
        if(lan === 'eng')
        {
            eng = 1;
        }
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var filename = req.param("filename").trim();
        filename = '.'+filename+'.list';
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/diag/GeneDiag.cgi")
            .query({user:userName,
                filename: filename,
                dir:currentDir,
                eng:eng
            });
        //console.log(url.toString());
        http('get', url.toString()).then(function(result){
            res.json(result);
        });


    },
    synAnalyze: function (req, res) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        else
        {
            if(req.session.lan !== 'undefined' && req.session.lan !== '')
            {
                lan = req.session.lan;
            }
            else
            {
                lan = 'chs';
                req.session.lan = lan;
            }



        }
        var eng = 0;
        if(lan === 'eng')
        {
            eng = 1;
        }
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var filename = req.param("filename").trim();
        var guid = req.param("guid").trim();
        var hpo = req.param("hpo").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/diag/SynDiag.cgi")
            .query({user:userName,
                filename: filename,
                dir:currentDir,
                eng:eng,
                hpo:hpo,
                guid:guid
            });
        //console.log(url.toString());
        http('get', url.toString()).then(function(result){
            res.json(result);
        });


    },
    exportCSV:function (req,res)
    {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var filter = req.param("filter").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/export/ExportCSV.cgi")
            .query({user:userName,
                filename: fileName,
                dir:currentDir,
                filter:filter
            });
        //console.log(url.toString());
        http.get(url.toString()).then(function(resultJson){
            //var filePath = resultJson.filedir;
            //console.log(filePath);
            //filePath = path.join(vcfpath,userName,currentDir,fileName);
            var file = resultJson.filedir;
            var fn = path.basename(file);
            res.setHeader('Content-disposition', 'attachment; filename=' + fn);
            var fileStream = fs.createReadStream(file);
            fileStream.pipe(res);
            //res.download(resultJson.filedir);

        });

    },
    annoHelper:function (req,res)
    {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var field = req.param("field").trim();
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/anno/AnnoHelper.cgi")
            .query({user:userName,
                filename: fileName,
                field:field,
                dir:currentDir
            });
        //console.log(url.toString());
        http.get(url.toString()).then(function(resultJson){
            res.json(resultJson);
        });
    },
    fileAnnotate: function (req,res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }

        var fileName = req.param("fileName").trim();
        var dbstr = req.param("dbstr").trim();
        var annoName = req.param("new").trim();

        var des = 'None';
        if(typeof req.param("des") !== 'undefined')
        {
            des = req.param("des").trim();
        }
        var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/anno/AnnoVCF.cgi")
            .query({user: userName,
                filename: fileName,
                dir: currentDir,  //dir should be changed to the actual path
                db:dbstr,
                new:annoName,
                des:des
            });
        //console.log(url.toString());
        var filePath = path.join(vcfpath,userName,currentDir,annoName);
        var w_data = '\n';
        w_data = new Buffer(w_data);
        fs.writeFile(filePath , w_data, {flag: 'a'}, function (err) {
            if(err)
            {
                res.json({res: 0});
            }
            else
            {
                //console.log(url.toString());
                http('get', url.toString()).then(function (result) {
                    res.json(result);
                    //console.log(result);
                });
            }
        });


    },
    fileDownload : function(req,res) {
        var userName = req.session.userName;
        var currentDir = req.session.currentDir;
        if(typeof currentDir === 'undefined' || currentDir === '/')
        {
            res.json({res:2});
            return;
        }
        if(typeof userName === 'undefined' || userName === '')
        {
            userName = 'public';
            if(currentDir === '/tmp')
            {
                currentDir = req.session.tempDir;
            }
        }
        var fileName = req.param("fileName");
        //var filePath = path.join("/var/www/cgi-bin/MDPA/GPS_data/user/",userName,fileName);
        var filePath = path.join(vcfpath,userName,currentDir,fileName);
        res.download(filePath);
    },
    api:function(req,res) {
        var id = req.param("id").trim();
        if(id === 'ListCustDB')
        {
            var userName = req.session.userName;
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/anno/ListCustomDB.cgi").query({user:userName});
            //console.log(url.toString());
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'RemoveCustomDB')
        {
            var userName = req.session.userName;
            var fileName = req.param("fileName").trim();
            var hg = req.param("hg").trim();
            var dbname = req.param("dbname").trim();
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/anno/RemoveCustomDB.cgi").query({user:userName,filename:fileName,dir:'/db',genome_version:hg,dbname:dbname});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'Select')
        {
            var query = req.param("query").trim();
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/SearchDB.cgi").query({query:query});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'NodeInfo')
        {
            var lan = req.param('lan');
            var termID = req.param('termID');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/NodeInfo.cgi").query({ID:termID,eng:eng});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'HotWords')
        {
            var lan = req.param('lan');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/HotWords.cgi").query({eng:eng});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'HPOTree')
        {
            var lan = req.param('lan');
            var termID = req.param('termID');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/HPOTreeData.cgi").query({eng:eng,ID:termID});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'GPSEngine')
        {
            var lan = req.param('lan');
            var hpo = req.param('hpo');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/GPSEngine.cgi").query({eng:eng,hpo:hpo});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'Network')
        {
            var lan = req.param('lan');
            var shpo = req.param('shpo');
            var thpo = req.param('thpo');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/Network.cgi").query({eng:eng,shpo:shpo,thpo:thpo});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'InputScore')
        {
            var lan = req.param('lan');
            var hpo = req.param('hpo');
            var disID = req.param('disID');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/InputScore.cgi").query({eng:eng,hpo:hpo,disID:disID});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'DiseaseInfo')
        {
            var lan = req.param('lan');
            var hpo = req.param('hpo');
            var disID = req.param('disID');
            if (typeof lan !== 'undefined' && lan !== '')
            {
                req.session.lan = lan;
            }
            else
            {
                if(req.session.lan !== 'undefined' && req.session.lan !== '')
                {
                    lan = req.session.lan;
                }
                else
                {
                    lan = 'chs';
                    req.session.lan = lan;
                }



            }
            var eng = 0;
            if(lan === 'eng')
            {
                eng = 1;
            }
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/DiseaseInfo.cgi").query({eng:eng,hpo:hpo,disID:disID});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'Mutation')
        {
            var gene = req.param('gene');
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/Mutation.cgi").query({gene:gene});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }
        if(id === 'PhenDiag')
        {
            var hpo = req.param('hpo');
            var user = req.param('user');
            var key = req.param('key');
            var url = new URI("https://www.diseasegps.org/cgi-bin/MDPA/api/PhenDiag.cgi").query({hpo:hpo,user:user,key:key});
            http.get(url.toString()).then(function(resultJson){
                res.json(resultJson);
            });
        }

    },

    //测试用
   /* test: function (req, res, next) {
        var url ="http://www.diseasegps.org/cgi-bin/MDPA/view/ViewItemsFlat.cgi?user=test&filename=1.vcf";
        //var json = '';
        http('get', url).then(function(resultJson){
            //console.log(resultJson);
            // json = resultJson;
            // var array = json;
            var result = resultJson.map(function (element) {
                return flatten(element);
            });
            //res.json(result);
            //var records = json(result);
            res.json(result);
            console.log(jsonToTable(result));

        });


        // var cwd = process.cwd();
        // console.log(cwd);
        // console.log(__dirname);
        // res.json(flatten())
    }*/
};

}());
