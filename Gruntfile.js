module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'app/app.js',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    },
    jshint: {
      all: ['app/*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['Chrome'],
        logLevel: 'ERROR'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load the plugin that provides the "karma" task.
  grunt.loadNpmTasks('grunt-karma');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

  grunt.registerTask('tests', ['jshint', 'uglify', 'karma']);

};