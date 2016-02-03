'use strict';

var gulp = require('gulp');
var taskLoader = require('gulp-simple-task-loader');
var plugins = require('gulp-load-plugins')();
var config = require('./config.json');

taskLoader({
    taskDirectory: 'bower_components/gulp-tasks/tasks',
    plugins: plugins,
    config: config
});

gulp.task('javascript', function () {
    gulp.src(config.javascript.src)
        .pipe(plugins.concat(config.javascript.outputname))
        .pipe(
            plugins.if(config.production,
                plugins.uglify(config.javascript.options)
            )
        )
        .pipe(gulp.dest(config.javascript.dest));
});

gulp.task('javascriptgooglemaps', function () {
    gulp.src(config.javascriptgooglemaps.src)
        .pipe(plugins.concat(config.javascriptgooglemaps.outputname))
        .pipe(
            plugins.if(config.production,
                plugins.uglify(config.javascriptgooglemaps.options)
            )
        )
        .pipe(gulp.dest(config.javascriptgooglemaps.dest));
});