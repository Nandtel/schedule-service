const gulp = require('gulp');
const usemin = require('gulp-usemin');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');
const ngTemplates = require('gulp-ng-templates');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const sass = require('gulp-sass');
const newer = require('gulp-newer');

const staticDir = 'src/main/resources/static/';
const tempDir = 'src/main/resources/static/temp/';
const webAppDir = 'src/main/webapp/';

gulp.task('source-concat', function() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/angular/angular.min.js',
            'node_modules/angular-animate/angular-animate.min.js',
            'node_modules/angular-aria/angular-aria.min.js',
            'node_modules/angular-material/angular-material.min.js',
            'src/main/webapp/js/src/moment-with-ru.min.js',
            'node_modules/angular-moment/angular-moment.min.js',
            'node_modules/twix/dist/twix.min.js',
            'src/main/webapp/js/src/lodash.min.js',
            'src/main/webapp/js/src/lodash.core.min.js',
            'src/main/webapp/js/src/ng-lodash.min.js'
    ])
        .pipe(newer(tempDir + 'source.min.js'))
        .pipe(concat('source.min.js'))
        .pipe(gulp.dest(tempDir))
});

gulp.task('app-concat', function () {
    return gulp.src(webAppDir + 'js/app/**/*.js')
        .pipe(newer(tempDir + 'app.min.js'))
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest(tempDir))
});

gulp.task('html-concat', function() {
    return gulp.src([
            webAppDir + 'template/*.html'
        ])
        .pipe(newer(tempDir + 'template.min.js'))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(ngTemplates({module: 'ScheduleModule', standalone: false}))
        .pipe(gulp.dest(tempDir))
});

gulp.task('schedule-hour-js', ['source-concat', 'app-concat', 'html-concat'], function () {
    return gulp.src([
        tempDir + 'source.min.js',
        tempDir + 'app.min.js',
        tempDir + 'template.min.js'
    ])
        .pipe(newer(staticDir + 'schedule-hour.min.js'))
        .pipe(concat('schedule-hour.min.js'))
        .pipe(gulp.dest(staticDir))
});

gulp.task('main-compile', function() {
    return gulp.src(webAppDir + 'css/main.scss')
        .pipe(newer({dest: tempDir, ext: '.css'}))
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest(tempDir))
});

gulp.task('schedule-hour-css', ['main-compile'], function() {
    return gulp.src([
            'node_modules/angular-material/angular-material.min.css',
            tempDir + 'main.css'
        ])
        .pipe(newer(staticDir + 'schedule-hour.min.css'))
        .pipe(concat('schedule-hour.min.css'))
        .pipe(gulp.dest(staticDir))
});

gulp.task('remove-temp', ['schedule-hour-js', 'schedule-hour-css'], function () {
    return del(tempDir);
});

gulp.task('build', ['remove-temp']);

gulp.task('default', function () {
    gulp.watch(webAppDir + 'js/**/*.js', ['schedule-hour-js']);
    gulp.watch(webAppDir + 'template/**/*.html', ['schedule-hour-js']);
    gulp.watch(webAppDir + 'css/**/*.scss', ['schedule-hour-css']);
});