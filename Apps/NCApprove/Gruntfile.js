module.exports = function (grunt) {
    var fs = require('fs');
    var path = require('path');

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    var main = ["../../js/main"]
    var dir = "../../components";
    var yycomponents = fs.readdirSync(dir);
    for (var i = 0, j = yycomponents.length; i < j; i++) {
        var name = yycomponents[i].split(".js")[0];
        yycomponents[i] = dir + "/" + name;
    }
    main = main.concat(yycomponents);


    try {
        var customerDir = "./components";
        var customerComponents = fs.readdirSync(customerDir);
        for (var i = 0, j = customerComponents.length; i < j; i++) {
            var name = customerComponents[i].split(".js")[0];
            customerComponents[i] = customerDir + "/" + name;
        }
        main = main.concat(customerComponents);


    } catch (e) {
        console.log(e);
    }


    dir = "./pages";
    var pages = fs.readdirSync(dir);
    for (var i = 0, j = pages.length; i < j; i++) {
        var name = pages[i].split(".js")[0];
        console.log(name);

        pages[i] = dir + "/" + name;
    }
    main = main.concat(pages);


    var libdir = "./libs";
    var libs = fs.readdirSync(libdir);
    var newlibs = [];
    for (var i = 0, j = libs.length; i < j; i++) {
        if (libs[i].indexOf('.js') > -1) {
            var name = libs[i].split(".js")[0];
            newlibs.push(libdir + "/" + name);
        } else {
        }

    }
    main = main.concat(newlibs);


    main.push("$");

    console.log(__dirname);
    console.log(main);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ["./pages/**.js", "./logic/**.js", "../../js/**.js"]
        },
        uglify: {
            // main: {
            //     src: ['user-login.js', 'login_app.js'],
            //     dest: 'dist/js/min',
            //     rename: function (dst, src) {
            //         return dst + '/' + src.replace('.js', '-min.js');
            //     }
            // }
        },
        requirejs: {
            compile: {
                "options": {
                    "baseUrl": "./",
                    "paths": {
                        "$": "../../libs/zepto",
                        "md5": "../../libs/md5",
                        "pm": "../../js/pageViewManager",
                        "base": "../../components/base",
                        "pageview": "../../components/pageview",
                        "utils": "../../js/utils",
                        "calendar": "../../components/calendar",
                        "swiper": "../../components/swiper",
                        "tip": "../../components/tip"
                    },
                    "include": main,
                    // "optimize": "none",
                    "out": "./dist/js/main.min.js"
                }
            },
        },
        cssmin: {
            compress: {
                files: {
                    'dist/css/common.min.css': [
                        "../../css/**.css",
                        "./css/**.css"
                    ]
                }
            }
        },
        clean: {
            main: {
                src: ['./dist']
            }
        },
        copy: {
            main: {
                files: [
                    {src: ['../../fonts/**'], dest: './dist/fonts/*/'},
                    {src: ['./fonts/**'], dest: './dist/'},
                    {src: ['../../libs/**'], dest: './dist/libs/*/'},
                    {src: ['./static/**'], dest: './dist/'},
                    {src: ['./user-chg.css'], dest: './dist/'},
                    {src: ['./jsloader*'], dest: './dist/'},
                    {src: ['./base-all.css'], dest: './dist/'},
                    {src: ['./dd-*'], dest: './dist/'},
                    {src: ['./wx*'], dest: './dist/'},
                    {src: ['./imgs/**'], dest: './dist/'},
                ]
            },
            replace: {
                files: [
                    {src: ['./index.html'], dest: './dist/'},
                ],
                options: {
                    process: function (content, srcpath) {
                        var result = '';
                        switch (srcpath) {
                            case './index.html': 
                                result = content.replace(/\<\!\-\- replac-start \-\-\>(?:.|\n)*\<\!\-\- replac-end \-\-\>/,
                                    [
                                        '<meta http-equiv="Pragma" content="no-cache">',
                                        '<meta http-equiv="Cache-Control" content="no-cache">',
                                        '<meta http-equiv="Expires" content="0">',
                                        '<META HTTP-EQUIV="pragma" CONTENT="no-cache">',
                                        '<META HTTP-EQUIV="Cache-Control" CONTENT="no-store, must-revalidate">',
                                        '<META HTTP-EQUIV="expires" CONTENT="Wed, 26 Feb 1997 08:21:57 GMT">',
                                        '<META HTTP-EQUIV="expires" CONTENT="0">',
                                        '<script src="./libs/require.js" data-main="./js/main.min.js?v=' + (+new Date()) + '"></script>',
                                        '<link href="./css/common.min.css?v='+ (+new Date()) +'" rel="stylesheet"/>'
                                    ].join('\n'));
                                break;
                            default:
                                result = content;
                                break;
                        }
                        return result;
                    }
                },
            },
        }
    });

    // 默认被执行的任务列表。
    grunt.registerTask('build', ["clean:main", "jshint", 'requirejs', 'cssmin', 'copy:main', 'copy:replace']);
};
