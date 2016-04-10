var gulp = require('gulp');
var usemin = require('gulp-usemin');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var ngTemplates = require('gulp-ng-templates');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var newer = require('gulp-newer');
var del = require('del');
var sass = require('gulp-sass');


gulp.task('app', function () {
    return gulp.src('src/main/webapp/js/app/**/*.js')
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/main/webapp/temp/js/'))
});

gulp.task('src', function() {
    return gulp.src([
        'src/main/webapp/js/src/jquery.min.js',
        'src/main/webapp/js/src/angular.min.js',
        'src/main/webapp/js/src/angular-animate.min.js',
        'src/main/webapp/js/src/angular-aria.min.js',
        'src/main/webapp/js/src/angular-material.min.js',
        'src/main/webapp/js/src/moment-with-ru.min.js',
        'src/main/webapp/js/src/angular-moment.min.js',
        'src/main/webapp/js/src/twix.min.js',
        'src/main/webapp/js/src/lodash.min.js',
        'src/main/webapp/js/src/lodash.core.min.js',
        'src/main/webapp/js/src/ng-lodash.min.js'
    ])
        .pipe(concat('source.min.js'))
        .pipe(gulp.dest('src/main/webapp/temp/js/'))
});

gulp.task('html', function() {
    return gulp.src([
        'src/main/webapp/**/*.html',
        '!src/main/webapp/index.html',
        '!src/main/webapp/index-copy.html'
    ])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(ngTemplates({module: 'ScheduleModule', standalone: false}))
        .pipe(gulp.dest('src/main/webapp/temp/js/'))
});

gulp.task('js-concat', ['app', 'src', 'html'], function() {
    return gulp.src([
            'src/main/webapp/temp/js/source.min.js',
            'src/main/webapp/temp/js/app.min.js',
            'src/main/webapp/temp/js/templates.min.js'
        ])
        .pipe(concat('schedule-hour.min.js'))
        .pipe(gulp.dest('src/main/resources/static/'))
});

gulp.task('js-clean', ['js-concat'], function() {
    return del('src/main/webapp/temp/js');
});

gulp.task('main-css', function() {
    return gulp.src('src/main/webapp/css/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/main/webapp/temp/css/'))
});

gulp.task('css-concat', ['main-css'], function() {
    return gulp.src([
        'src/main/webapp/css/angular-material.min.css',
        'src/main/webapp/temp/css/main.css'
    ])
        .pipe(concat('schedule-hour.min.css'))
        .pipe(gulp.dest('src/main/resources/static/'))
});

gulp.task('css-clean', ['css-concat'], function() {
    return del('src/main/webapp/temp/css');
});

gulp.task('default', ['js-clean', 'css-clean'], function() {
    return del('src/main/webapp/temp');
});

gulp.task('watch', ['js-clean', 'css-clean'], function () {
    gulp.watch('src/main/resources/static/js/**/*.js', ['js-clean']);
    gulp.watch('src/main/resources/static/css/*.css', ['css-clean']);
});