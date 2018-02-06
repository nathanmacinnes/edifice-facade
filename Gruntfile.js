module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON("package.json"),
    mochaTest : {
      test : {
        options : {
          reporter : "spec"
        },
        src : ["test/*.js"]
      }
    },
    jshint : {
      core : ["Gruntfile.js"],
      test : ["test/*.js"],
      lib : ["lib/*.js"],
      options : {
        jshintrc : true
      }
    },
    jscs : {
      lib : {
        src : "lib/*.js",
      },
      test : {
        src : "test/*.js"
      },
      misc : {
        src : ["Gruntfile.js"]
      },
      options : {
        config : ".jscsrc"
      }
    },
    watch : {
      lib : {
        files : ["lib/*.js"],
        tasks : ["jshint:lib", "jscs:lib", "test"]
      },
      test : {
        files : ["test/*.js"],
        tasks : ["jshint:test", "jscs:test", "test"]
      },
      grunt : {
        files : ["Gruntfile.js"],
        tasks : ["jshint:core", "jscs:misc"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask("test", "mochaTest");
  grunt.registerTask("lint", "jshint");

  grunt.registerTask("default", ["lint", "jscs", "test"]);

  grunt.loadNpmTasks("grunt-contrib-watch");
};
