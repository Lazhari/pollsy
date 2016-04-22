module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            scripts: {
                files: ['routes/**', 'app.js'],
                tasks: ['apidoc'],
                options: {
                    interrupt: true,
                },
            },
        },
        apidoc: {
            mypp: {
                src: "routes",
                dest: "./specs-doc/",
                options: {
                    debug: true,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [ "node_modules/" ]
                }
            }
        },
        nodemon: {
            dev: {
                script: './bin/www',
                options: {
                    args: ['dev'],
                    nodeArgs: ['--debug'],
                    env: {
                        PORT: '9090'
                    },
                    cwd: __dirname,
                    ignore: ['node_modules/**'],
                    ext: 'js,coffee',
                    watch: ['**'],
                    delay: 1000,
                    legacyWatch: true,
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('open')('http://localhost:9090');
                            }, 1000);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    }
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('doc',['apidoc']);
    grunt.registerTask('serve',['nodemon']);
    grunt.registerTask('default', ['doc','nodemon', 'watch']);
};
