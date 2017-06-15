var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    scss = require('gulp-scss'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    ftp = require('vinyl-ftp'),
    notify = require("gulp-notify"),
    jade = require('gulp-jade');

// Скрипты проекта

gulp.task('common-js', function () {
    return gulp.src([
        'app/js/common.js'
    ])
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function () {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/jquery-eu-cookie-law-popup.js'
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify()) // Минимизировать весь js (на выбор)
        .pipe(gulp.dest('app/js'))
        .pipe(gulp.dest('../static/js'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false,
        open: false
    });
});
gulp.task('scss', function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(gulp.dest('app/css'))
        .pipe(gulp.dest('../static/css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('templates', function () {
    var YOUR_LOCALS = {};

    gulp.src(['app/jade/*.jade', '!app/jade/_*.jade'])
        .pipe(jade({
            locals: YOUR_LOCALS
        }))
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({ stream: true }));
});


gulp.task('watch', ['templates', 'scss', 'js', 'browser-sync'], function () {
    // gulp.watch('app/sass/**/*.sass', ['sass']);
    gulp.watch('app/jade/**/*.jade', ['templates']);
    gulp.watch('app/scss/**/*.scss', ['scss']);
    gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
    gulp.watch('app/index.html', browserSync.reload);
});

gulp.task('imagemin', function () {
    return gulp.src('app/img/**/**/**/*')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('../static/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'scss', 'js'], function () {

    var buildFiles = gulp.src([
        'app/templates/*.html',
        'app/.htaccess'
    ]).pipe(gulp.dest('../build_html'));

    var buildCss = gulp.src([
        'app/css/main.min.css'
    ]).pipe(gulp.dest('../static/css'));

    var buildJs = gulp.src([
        'app/js/scripts.min.js'
    ]).pipe(gulp.dest('../static/js'));

    var buildFonts = gulp.src([
        'app/fonts/**/*'
    ]).pipe(gulp.dest('../static/fonts'));

    var buildImg = gulp.src([
        'app/img/**/**/**/*'
    ]).pipe(gulp.dest('../static/img'));

});


gulp.task('removedist', function () {
    return del.sync('dist');
});
gulp.task('clearcache', function () {
    return cache.clearAll();
});


gulp.task('default', ['watch']);

