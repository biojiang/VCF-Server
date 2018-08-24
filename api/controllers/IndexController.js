/**
 * 控制器。
 * 数据库查询语句参考：http://sailsjs.com/documentation/concepts/models-and-orm/query-language
 */
(function () {
    "use strict";

var Promise = require('es6-promise').Promise;
var Crypto = require('crypto');
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
var vcfpath = '/data/users/';
//var vcfpath = curDir+'/cloud/';
var hostname = "http://localhost/cgi-bin/VCF-Server/";
//var hostname = "https://www.diseasegps.org/cgi-bin/MDPA/";

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
    index: function(req, res, next) {
        var lan = req.param('lan');
        if (typeof lan !== 'undefined' && lan !== '')
        {
            req.session.lan = lan;
        }
        res.locals.view = "index";
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

        res.locals.navMod = 0;

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
        res.locals.navMod = 0;
        res.locals.fileName = fileName;
        res.locals.filter = filter;
        return quickTemplate(req, res);
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
            res.locals.currentDir = req.session.currentDir;
            res.locals.study = req.session.study;
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
            res.json({res:1});
            //req.session.tempDir = undefined;
            //return quickTemplate(req, res);
        }
        else
        {
            var usrName = req.param("loginname").trim().toLowerCase();
            //var psw = myMD5(req.param("loginpassword"));
            var psw = req.param("loginpassword");
            var url = new URI(hostname+"proc/CheckUser.cgi")
                .query({user: userName,passwd:psw});
            //console.log(url.toString());
            http('get', url.toString()).then(function (result) {
                if(result.res === 1)
                {
                    req.session.userName = usrName;
                    req.session.currentDir = '/';
                    req.session.study = 0;
                    res.send('success');
                }
                else
                {
                    res.send('error');
                }
            });

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
        var url = new URI(hostname+"view/ViewVariants.cgi")
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
        var url = new URI(hostname+"view/ViewSelect.cgi")
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

                var url = new URI(hostname+"proc/Import2DBQueue.cgi")
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

                var url = new URI(hostname+"anno/ImportAnnoDB.cgi")
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
        var url = new URI(hostname+"proc/DeleteRecord.cgi")
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
        var url = new URI(hostname+"proc/Monitor.cgi")
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
        var url = new URI(hostname+"view/ViewHeaderFlat.cgi")
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
        var url = new URI(hostname+"index/IndexHelper.cgi")
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
        var url = new URI(hostname+"index/IndexBuild.cgi")
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
        var url = new URI(hostname+"filter/FilterHelper.cgi")
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
        var url = new URI(hostname+"filter/FilterConstructor.cgi")
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

        var url = new URI(hostname+"view/ViewItemsFlat.cgi")
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
        var url = new URI(hostname+"export/ExportCSV.cgi")
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
        var url = new URI(hostname+"anno/AnnoHelper.cgi")
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
        var url = new URI(hostname+"anno/AnnoVCF.cgi")
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
            var url = new URI(hostname+"anno/ListCustomDB.cgi").query({user:userName});
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
            var url = new URI(hostname+"anno/RemoveCustomDB.cgi").query({user:userName,filename:fileName,dir:'/.db',genome_version:hg,dbname:dbname});
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
