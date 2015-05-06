var gulp = require('gulp'),
  jsdoc = require('gulp-jsdoc'),
  less = require('gulp-less'),
  uglify = require('gulp-uglify')

/*
* Configuración de la tarea 'demo'
*/

gulp.task('jsdoc', function(){
    gulp.src('js/**/*.js')
        .pipe(jsdoc())
        .pipe(gulp.dest('out'))
});

gulp.task('less', function(){
    gulp.src('styles/less/main.less')
        .pipe(less())
        .pipe(gulp.dest('./styles/css'))
});

gulp.task('default', ['less', 'jsdoc']);