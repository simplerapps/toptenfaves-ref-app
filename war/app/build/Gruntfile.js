module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // add all sub-files together
    concat: {
    	options: {
    		separator: ';'
    	},
    	dist: {
    		src: ['../comp/MainApp.js', '../comp/**/*.js','../comp/ui/**/*.js'],
    		dest: 'dist/<%= pkg.name %>.js'
    	}
    },
    
    // make ugly (remove white space)
    uglify: {
    	options: {
    		banner: '/* Share10 App v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
    		mangle: true
    	},
    	dist: {
    		files: [
    		   {'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']}
    		]
    	}
    },
    
    // copy files  
    copy: {
    	dev: {
    		files: [
    	      // includes files within path
    	      {expand: true, cwd:'dist', src: ['*.js'], dest: '../lib/app', filter: 'isFile'}
    	    ]
    	  }
    	}  
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('default', ['concat', 'uglify', 'copy']);

};
