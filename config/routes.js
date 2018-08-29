/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

/**
 * 此处将每个sails.js控制器与URL绑定。控制器名字与URL一般差不多。
 *
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/
  '/': {
    controller: 'IndexController'
  },

   '/vcf_viewer': {
     controller: 'IndexController',
     action: 'VCFViewer'
    },
    '/management': {
        controller: 'IndexController',
        action: 'management'
    },

    //api用于请求后台数据
    '/api/:id': {
        controller: 'IndexController',
        action: 'api'
    },

  '/signIn': {
      controller: 'IndexController',
      action: 'signIn'
  },

  '/signOut': {
      controller: 'IndexController',
      action: 'signIn'
  },

    '/pdf_reader': {
        controller: 'IndexController',
        action: 'pdf_reader'
    },

    //显示服务器文件
    //'/files/:filePath' : {
    '/files' : {
        controller: 'IndexController',
        action: 'files'
    },

    //文件下载
    '/file/:fileName' : {
        controller: 'IndexController',
        action: 'fileDownload'
    },

    //文件上传
    '/file_upload' : {
        controller: 'IndexController',
        action: 'fileUpload'
    },

    //DB文件上传
    '/file_uploadDB' : {
        controller: 'IndexController',
        action: 'fileUploadDB'
    },
    //CSV导出
    '/export_csv' : {
        controller: 'IndexController',
        action: 'exportCSV'
    },
    //文件名检查
    '/file_check' : {
        controller: 'IndexController',
        action: 'checkFileExist'
    },
    //文件删除
    '/file_delete/:fileName' : {
        controller: 'IndexController',
        action: 'fileDelete'
    },

    //VCF分析
    '/file_analyze' : {
        controller: 'IndexController',
        action: 'fileAnalyze'
    },
    //VCF表头信息
    '/table_header' : {
        controller: 'IndexController',
        action: 'tableHeader'
    },
    //索引信息
    '/index_status' : {
        controller: 'IndexController',
        action: 'indexStatus'
    },
    //添加/删除 索引
    '/index_build' : {
        controller: 'IndexController',
        action: 'indexBuild'
    },
    //VCF变异数
    '/variants' : {
        controller: 'IndexController',
        action: 'variants'
    },

    //新建研究
    '/newStudy' : {
        controller: 'IndexController',
        action: 'newStudy'
    },
    //获取进度
    '/monitorStat' : {
        controller: 'IndexController',
        action: 'monitorStat'
    },
    //删除研究
    '/studyDelete' : {
        controller: 'IndexController',
        action: 'studyDelete'
    },
    //打开研究
    '/openStudy' : {
        controller: 'IndexController',
        action: 'openStudy'
    },
    //关闭研究
    '/closeStudy' : {
        controller: 'IndexController',
        action: 'closeStudy'
    },
    //可用filter查询
    '/filterHelper' : {
        controller: 'IndexController',
        action: 'filterHelper'
    },
    //filter构造器
    '/filters' : {
        controller: 'IndexController',
        action: 'filterConstructor'
    },
    //VCF注释
    '/file_annotate' : {
        controller: 'IndexController',
        action: 'fileAnnotate'
    },
    //VCF注释数据库获取
    '/annoHelper' : {
        controller: 'IndexController',
        action: 'annoHelper'
    },
    //测试用
  /*'/test': {
      controller: 'IndexController',
      action: 'test'
  }
*/
  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

};