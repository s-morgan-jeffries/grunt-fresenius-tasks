/*
 * grunt-fresenius-tasks
 * https://github.com/s-morgan-jeffries/grunt-fresenius-tasks
 *
 * Copyright (c) 2015 S Morgan Jeffries
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt, projectConfig) {

  // Load grunt tasks.
  // Here are all the packages
  var gruntModules = [
      'assemble',
      'grunt-autoprefixer',
      'grunt-concurrent',
      'grunt-contrib-clean',
      'grunt-contrib-concat',
      'grunt-contrib-connect',
      'grunt-contrib-copy',
      'grunt-contrib-cssmin',
      'grunt-contrib-htmlmin',
      'grunt-contrib-imagemin',
      'grunt-contrib-jshint',
      'grunt-contrib-stylus',
      'grunt-contrib-uglify',
      'grunt-contrib-watch',
      'grunt-google-cdn',
      //'grunt-replace',
      'grunt-rev',
      'grunt-spritesmith',
      'grunt-svgmin',
      'grunt-usemin'
      //'grunt-wiredep'
    ],
    path = require('path'),
    fs = require('fs'),
    // The root directory for npm modules
    modulesRoot = path.resolve(__dirname + '/node_modules/');
  //console.log(__dirname);
  //console.log(modulesRoot);
  for (var i = gruntModules.length; i--;) {
    // Current module
    var name = gruntModules[i],
      // The tasks directory of the current module
      tasksDir = modulesRoot + '/' + name + '/tasks';
    // The current taskFiles
    var taskFiles = fs.readdirSync(tasksDir);
    for (var j = taskFiles.length; j--;) {
      // The current file or directory
      var file = tasksDir + '/' + taskFiles[j];
      // If it's a file...
      if (fs.statSync(file).isFile()) {
        // Require it and call it
        var fn = require(file);
        fn.call(grunt, grunt);
      }
    }
  }

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  //
  // Define the configuration for all the tasks
  grunt.initConfig({

    projectconfig: projectConfig,

    //////////////////////////////////////////////
    // Assemble
    //////////////////////////////////////////////
    assemble: {
      options: {
        // Don't use this. We're using the base_layout.hbs file for usemin, so we
//        assets: 'assets',
        // No plugins for now
//        plugins: ['assemble-middleware-lunr'],
        helpers: [],
        partials: ['<%= projectconfig.sharedAssets %>/templates/partials/**/*.hbs'],
        layoutdir: '<%= projectconfig.sharedAssets %>/templates/layouts',
        data: '<%= projectconfig.localAssets %>/data/**/*.{json,yml}',
        flatten: true
      },
      develop: {
        expand: true,
        cwd: '<%= projectconfig.sharedAssets %>/templates/pages',
        src: [
          './**/*.hbs'
        ],
        dest: '<%= projectconfig.temp %>/'
      },
      build: {
        expand: true,
        cwd: '<%= projectconfig.sharedAssets %>/templates/pages',
        src: [
          './**/*.hbs'
        ],
        dest: '<%= projectconfig.dist %>/'
      }
    },

    //////////////////////////////////////////////
    // Autoprefixer
    //////////////////////////////////////////////
    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      build: {
        files: [{
          expand: true,
          cwd: '<%= projectconfig.temp %>/styles/',
          src: '{,*/}*.css',
          dest: '<%= projectconfig.temp %>/styles/'
        }]
      }
    },

    //////////////////////////////////////////////
    // CDNify
    //////////////////////////////////////////////
    // Replace Google CDN references
    cdnify: {
      build: {
        html: ['<%= projectconfig.dist %>/**/*.html']
      }
    },

    //////////////////////////////////////////////
    // Clean
    //////////////////////////////////////////////
    // Empties folders to start fresh
    clean: {
      develop: '<%= projectconfig.temp %>',
      build: {
        files: [{
          dot: true,
          src: [
            '<%= projectconfig.temp %>',
            '<%= projectconfig.dist %>/*',
            '!<%= projectconfig.dist %>/.git*',
            '!<%= projectconfig.dist %>/CNAME'
          ]
        }]
      }
    },

    //////////////////////////////////////////////
    // Concurrent
    //////////////////////////////////////////////
    // Run some tasks in parallel to speed up the build process
    concurrent: {
      //develop: [
      //  'stylus:develop'
      //],
      test: [
        'stylus:build'
      ],
      build: [
        'stylus:build',
        'imagemin',
        'svgmin'
      ]
    },

    //////////////////////////////////////////////
    // Connect
    //////////////////////////////////////////////
    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0'
      },
      develop: {
        options: {
          open: true,
          base: [
            '<%= projectconfig.temp %>',
            '<%= projectconfig.localAssets %>',
            '<%= projectconfig.sharedAssets %>'
          ],
          livereload: 35729
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '<%= projectconfig.temp %>',
            'test',
            '<%= projectconfig.localAssets %>'
          ]
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= projectconfig.dist %>'
        }
      }
    },

    //////////////////////////////////////////////
    // Copy
    //////////////////////////////////////////////
    // Copies remaining files to places other tasks can use
    copy: {
      //build1: {
      //  expand: true,
      //  cwd: '<%= projectconfig.sharedAssets %>/views/templates/',
      //  src: 'base_layout.hbs',
      //  dest: '<%= projectconfig.temp %>'
      //},
      build: {
        files: [
          // Copy local assets to dist
          //{
          //  expand: true,
          //  dot: true,
          //  cwd: '<%= projectconfig.localAssets %>',
          //  dest: '<%= projectconfig.dist %>',
          //  src: [
          //    '*.{ico,png,txt}',
          //    '.htaccess',
          //    '*.html',
          //    'views/{,*/}*.html',
          //    'images/{,*/}*.{webp}',
          //    'fonts/*'
          //  ]
          //},
          // Copy shared assets to dist
          {
            expand: true,
            dot: true,
            cwd: '<%= projectconfig.sharedAssets %>',
            dest: '<%= projectconfig.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'images/{,*/}*.{webp}',
              'fonts/*'
            ]
          },
          //{
          //  expand: true,
          //  cwd: '<%= projectconfig.temp %>/images',
          //  dest: '<%= projectconfig.dist %>/images',
          //  src: ['generated/*']
          //},
          //{
          //  expand: true,
          //  cwd: '<%= projectconfig.temp %>',
          //  dest: '<%= projectconfig.dist %>',
          //  src: ['**/*.html']
          //},
          // You have to have this to copy fonts
          {
            expand: true,
            cwd: '<%= projectconfig.sharedAssets %>',
            dest: '<%= projectconfig.dist %>',
            src: [
              'bower_components/**/*.eot',
              'bower_components/**/*.svg',
              'bower_components/**/*.ttf',
              'bower_components/**/*.woff'
            ]
          }
        ]
      }
      //styles: {
      //  expand: true,
      //  cwd: '<%= projectconfig.src %>/styles',
      //  dest: '<%= projectconfig.temp %>/styles/',
      //  src: '{,*/}*.css'
      //}
    },

    //////////////////////////////////////////////
    // CSSmin
    //////////////////////////////////////////////
    // The following *-min tasks produce minified files in the dist folder
    cssmin: {
      options: {
        root: '<%= projectconfig.temp %>/styles'
      }
    },

    //////////////////////////////////////////////
    // HTMLmin
    //////////////////////////////////////////////
    htmlmin: {
      build: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= projectconfig.dist %>',
          src: ['*.html', 'views/{,*/}*.html'],
          dest: '<%= projectconfig.dist %>'
        }]
      }
    },

    //////////////////////////////////////////////
    // Imagemin
    //////////////////////////////////////////////
    imagemin: {
      build: {
        files: [
          {
            expand: true,
            cwd: '<%= projectconfig.sharedAssets %>/images',
            // Every non-SVG image in the sharedAssets/images directory except for what's in the sprites subdirectory
            src: [
              '{,*/}*.{png,jpg,jpeg,gif}',
              '!sprites/**/*'
            ],
            dest: '<%= projectconfig.dist %>/images'
          },
          {
            expand: true,
            cwd: '<%= projectconfig.localAssets %>/images',
            // Every non-SVG image in the localAssets/images directory except for what's in the sprites subdirectory
            src: [
              '{,*/}*.{png,jpg,jpeg,gif}',
              '!sprites/**/*'
            ],
            dest: '<%= projectconfig.dist %>/images'
          },
          {
            expand: true,
            cwd: '<%= projectconfig.temp %>/images',
            // Every non-SVG image in the temp/images directory
            src: '{,*/}*.{png,jpg,jpeg,gif}',
            dest: '<%= projectconfig.dist %>/images'
          }
        ]
      }
    },

    //////////////////////////////////////////////
    // JShint
    //////////////////////////////////////////////
    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: ['Gruntfile.js']
      }
      //scripts: {
      //  src: [
      //    '<%= projectconfig.sharedAssets %>/scripts/**/*.js'
      //  ]
      //}
//      e2eTests: {
//        options: {
//          jshintrc: 'test/e2e/.jshintrc'
//        },
//        src: ['test/e2e/spec/{,*/}*.js']
//      },
//      integrationTests: {
//        options: {
//          jshintrc: 'test/integration/.jshintrc'
//        },
//        src: ['test/integration/spec/{,*/}*.js']
//      },
//      unitTests: {
//        options: {
//          jshintrc: 'test/unit/.jshintrc'
//        },
//        src: ['test/unit/spec/{,*/}*.js']
//      }
    },

//    // Test settings
//    karma: {
//      options: {
//        files: [
//          // Add polyfill for bind, which is missing from PhantomJS
//          '../bindPolyfill.js',
//          // Add jasmine-matchers
//          '../../node_modules/jasmine-expect/dist/jasmine-matchers.js',
//          // Add sinon
//          '../../<%= projectconfig.src %>/bower_components/sinonjs/sinon.js',
//          '../../<%= projectconfig.src %>/bower_components/jasmine-sinon/lib/jasmine-sinon.js',
//          // Dependencies (if any)
//          // Utilities (if any)
////          '../../<%= projectconfig.src %>/bower_components/lodash/dist/lodash.js',
//          // The source files for the scripts under test
//          '../../<%= projectconfig.src %>/scripts/**/*.js',
//          // These are all the tests.
//          'spec/**/*.js'
//        ]
//      },
//      unitCI: {
//        configFile: 'test/unit/karma.unit.ci.conf.js',
//        singleRun: true
//      },
//      unitBuild: {
//        configFile: 'test/unit/karma.unit.build.conf.js',
//        singleRun: true
//      },
//      unitTravis: {
//        configFile: 'test/unit/karma.unit.travis.conf.js',
//        singleRun: true
//      }
////      ,
////      integrationCI: {
////        configFile: 'test/integration/karma.integration.ci.conf.js',
////        singleRun: true
////      },
////      integrationBuild: {
////        configFile: 'test/integration/karma.integration.build.conf.js',
////        singleRun: true
////      },
////      integrationTravis: {
////        configFile: 'test/integration/karma.integration.travis.conf.js',
////        singleRun: true
////      }
//    },


    //////////////////////////////////////////////
    // Rev
    //////////////////////////////////////////////
    // Renames files for browser caching purposes
    rev: {
      build: {
        files: {
          src: [
            '<%= projectconfig.dist %>/scripts/{,*/}*.js',
            '<%= projectconfig.dist %>/styles/{,*/}*.css',
            '<%= projectconfig.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= projectconfig.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    //////////////////////////////////////////////
    // Spritesmith
    //////////////////////////////////////////////
    sprite: {
      all: {
        // Sprite files to read in
        'src': [
          '<%= projectconfig.localAssets %>/images/sprites/**/*.png',
          '<%= projectconfig.sharedAssets %>/images/sprites/**/*.png'
        ],

        // Location to output spritesheet
        'destImg': '<%= projectconfig.temp %>/images/sprite.png',

        // Stylus with variables under sprite names
        'destCSS': '<%= projectconfig.temp %>/styles/components/sprite_map.styl',

        // OPTIONAL: Manual override for imgPath specified in CSS
//        'imgPath': '../sprite.png',

        // OPTIONAL: Specify algorithm (top-down, left-right, diagonal [\ format],
        // alt-diagonal [/ format], binary-tree [best packing])
        // Visual representations can be found below
//        'algorithm': 'alt-diagonal',

        // OPTIONAL: Specify padding between images
//        'padding': 2,

        // OPTIONAL: Specify engine (auto, phantomjs, canvas, gm, pngsmith)
//        'engine': 'canvas',

        // OPTIONAL: Specify CSS format (inferred from destCSS' extension by default)
        // (stylus, scss, scss_maps, sass, less, json, json_array, css)
        //        'cssFormat': 'json',

        // OPTIONAL: Specify a function or Mustache template to use for rendering destCSS
        // Mutually exclusive to cssFormat
        // More information can be found below
        // Without __dirname, this path would be relative to the importing module's directory, but we want to import
        // from spritesmith-stylus in the fresenius_tasks directory and not assume that the importing module will have
        // it installed.
        'cssTemplate': __dirname + '/node_modules/spritesmith-stylus/sprite_positions.styl.mustache'

        // OPTIONAL: Map variable of each sprite
//        'cssVarMap': function (sprite) {
//          // `sprite` has `name`, `image` (full path), `x`, `y`
//          //   `width`, `height`, `total_width`, `total_height`
//          // EXAMPLE: Prefix all sprite names with 'sprite-'
//          sprite.name = 'sprite-' + sprite.name;
//        },

        // OPTIONAL: Specify settings for algorithm
//        'algorithmOpts': {
//          // Skip sorting of images for algorithm (useful for sprite animations)
//          'sort': false
//        },

        // OPTIONAL: Specify settings for engine
//        'engineOpts': {
//          'imagemagick': true
//        },

        // OPTIONAL: Specify img options
//        'imgOpts': {
//          // Format of the image (inferred from destImg' extension by default) (jpg, png)
        //          'format': 'png',
//
//          // gm only: Quality of image
//          'quality': 90,
//
//          // phantomjs only: Milliseconds to wait before terminating PhantomJS script
//          'timeout': 10000
//        },

        // OPTIONAL: Specify css options
//        'cssOpts': {
//          // Some templates allow for skipping of function declarations
//          'functions': false,
//
//          // CSS template allows for overriding of CSS selectors
//          'cssClass': function (item) {
//            return '.sprite-' + item.name;
//          }
//        }
      }
    },

    //////////////////////////////////////////////
    // Stylus
    //////////////////////////////////////////////
    stylus: {
      options: {
        paths: [
          '<%= projectconfig.localAssets %>/styles',
          '<%= projectconfig.localAssets %>/bower_components',
          '<%= projectconfig.sharedAssets %>/styles',
          '<%= projectconfig.sharedAssets %>/bower_components',
          'node_modules'
        ]
//          urlfunc: 'embedurl', // use embedurl('test.png') in our code to trigger Data URI embedding
//          use: [
//            function () {
//              return testPlugin('yep'); // plugin with options
//            },
//            require('fluidity') // use stylus plugin at compile time
//          ]
//          ,
//          import: [      //  @import 'foo', 'bar/moo', etc. into every .styl file
//            'foo',       //  that is compiled. These might be findable based on values you gave
//            'bar/moo'    //  to `paths`, or a plugin you added under `use`
//          ]
      },
      develop: {
        options: {
          compress: false,
          linenos: true
        },
        files: {
          '<%= projectconfig.temp %>/styles/style.css': ['<%= projectconfig.localAssets %>/styles/index.styl']
        }
      },
      build: {
        options: {
          compress: false,
          linenos: false
        },
        files: {
          '<%= projectconfig.temp %>/styles/style.css': ['<%= projectconfig.localAssets %>/styles/index.styl']
        }
      }
    },

    //////////////////////////////////////////////
    // SVGmin
    //////////////////////////////////////////////
    svgmin: {
      build: {
        files: [
          {
            expand: true,
            cwd: '<%= projectconfig.sharedAssets %>/images',
            src: '{,*/}*.svg',
            dest: '<%= projectconfig.dist %>/images'
          },
          {
            expand: true,
            cwd: '<%= projectconfig.localAssets %>/images',
            src: '{,*/}*.svg',
            dest: '<%= projectconfig.dist %>/images'
          }
        ]
      }
    },

    //////////////////////////////////////////////
    // Usemin
    //////////////////////////////////////////////
    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= projectconfig.dist %>/**/*.html'],
      css: ['<%= projectconfig.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= projectconfig.dist %>']
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= projectconfig.sharedAssets %>/templates/layouts/base_layout.hbs',
      options: {
        dest: '<%= projectconfig.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    //////////////////////////////////////////////
    // Watch
    //////////////////////////////////////////////
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:gruntfile']
      },
      //bower: {
      //  files: ['<%= projectconfig.sharedAssets %>/bower.json'],
      //  tasks: ['wiredep', 'replace:develop']
      //},
      handlebars: {
        files: [
          '<%= projectconfig.localAssets %>/data/**/*.{yml,json}',
          '<%= projectconfig.localAssets %>/images/**/*',
          '!<%= projectconfig.localAssets %>/images/sprites/**/*'
        ],
        tasks: ['assemble'],
        options: {
          livereload: true
        }
      },
      sprite: {
        files: [
          '<%= projectconfig.localAssets %>/images/sprites/**/*'
        ],
        tasks: ['sprite', 'stylus:develop', 'autoprefixer'],
        options: {
          livereload: true
        }
      },
      stylus: {
        files: [
          '<%= projectconfig.localAssets %>/styles/**/*.styl'
        ],
        tasks: ['stylus:develop', 'autoprefixer'],
        options: {
          livereload: true
        }
      },
      //scripts: {
      //  files: ['<%= projectconfig.sharedAssets %>/scripts/**/*.js'],
      //  tasks: ['jshint:scripts', 'karma:unitCI'],
      //  options: {
      //    livereload: true
      //  }
      //},
      //unitTests: {
      //  files: ['test/unit/spec/**/*.js'],
      //  tasks: ['jshint:unitTests', 'karma:unitCI']
      //},
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= projectconfig.temp %>/{,*/}*.html',
          '<%= projectconfig.temp %>/styles/{,*/}*.css',
          '<%= projectconfig.temp %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= projectconfig.localAssets %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= projectconfig.sharedAssets %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }
    //
    //// t0d0: Move this into fresenius-assets
    ////////////////////////////////////////////////
    //// Wiredep
    ////////////////////////////////////////////////
    //// Automatically inject Bower components into the html
    //wiredep: {
    //  all: {
    //    src: ['<%= projectconfig.sharedAssets %>/templates/layouts/base_layout.hbs'],
    //    exclude: [
    //      '<%= projectconfig.sharedAssets %>/bower_components/json3/lib/json3.min.js',
    //      '<%= projectconfig.sharedAssets %>/bower_components/es5-shim/es5-shim.js'
    //    ],
    //    bowerJson: '<%= projectconfig.bower %>',
    //    directory: '<%= projectconfig.sharedAssets %>/bower_components',
    //    cwd: '<%= projectconfig.sharedAssets %>/templates/layouts'
    //  }
    //}
  });


  grunt.registerTask('develop', function () {
    var projectConfig = grunt.config.get('projectconfig'),
      injectBowerTasks = [],
      developTasks;
    // Check for bower property and add the bower injection tasks if it exists
    if (projectConfig.bower) {
      injectBowerTasks = [
        'wiredep',
        'replace:develop',
      ];
    }

    developTasks = ['clean:develop']
      .concat(injectBowerTasks)
      .concat([
        ////////////////////
        // concurrent:develop
        'sprite',
        'assemble:develop',
        ////////////////////
        'stylus:develop',
        'autoprefixer',
        'connect:develop',
        'watch'
      ]);
    grunt.task.run(developTasks);
  });

  grunt.registerTask('servedist', ['connect:dist:keepalive']);

  grunt.registerTask('build', function (target) {
    var buildTasks = [
      'clean:build',
      //'wiredep',
      //'replace:build',
      ////////////////////
      // concurrent:build1
      'useminPrepare',
      'assemble:build',
      'sprite',
      ////////////////////
      ////////////////////
      // concurrent:build2
      'stylus:build',
      'imagemin',
      'svgmin',
      'concat',
      ////////////////////
      'autoprefixer',
      ////////////////////
      // concurrent:build3
      'cdnify',
      'cssmin',
      'uglify',
      ////////////////////
      'rev',
      'usemin',
      //'htmlmin',
      'copy:build'
    ];

    if (target === 'serve') {
      return grunt.task.run(buildTasks.concat(['servedist']));
    }

    grunt.task.run(buildTasks);
  });

};