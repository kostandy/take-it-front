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
gulp.task('js', function () {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/jquery-eu-cookie-law-popup.js',
        'app/js/*.js',
        '!app/js/scripts.min.js'
    ])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'))
        .pipe(gulp.dest('../take-it-easy/django_static/js'))
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
        .pipe(gulp.dest('../take-it-easy/django_static/css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('templates', function () {
    var YOUR_LOCALS = {};

    gulp.src(['app/jade/*.jade', '!app/jade/blocks', '!app/jade/pages'])
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
    gulp.watch(['libs/**/*.js', 'app/js/custom.js'], ['js']);
    gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('imagemin', function () {
    return gulp.src('app/img/**/**/**/*')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('../backend/django_static/img'));
});

gulp.task('build-html', function () {
    var YOUR_LOCALS = {};

    gulp.src([
        'app/*.html'
    ]).pipe(gulp.dest('../backend/templates/src'));
});


/* Building html blocks for using in django temlates, KISS-DRY */
gulp.task('bb-html', function () {
    var YOUR_LOCALS = {};
    gulp.src(['app/jade/blocks/*.jade'])
        .pipe(jade({
            locals: YOUR_LOCALS
        }))
        .pipe(gulp.dest('../backend/templates/src/blocks'))
});

gulp.task('build', ['imagemin', 'scss', 'js'], function () {

    var buildCss = gulp.src([
        'app/css/main.min.css'
    ]).pipe(gulp.dest('../take-it-easy/django_static/css'));

    var buildJs = gulp.src([
        'app/js/scripts.min.js'
    ]).pipe(gulp.dest('../take-it-easy/django_static/js'));

    var buildFonts = gulp.src([
        'app/fonts/**/*'
    ]).pipe(gulp.dest('../take-it-easy/django_static/fonts'));

    var buildImg = gulp.src([
        'app/img/**/**/**/*'
    ]).pipe(gulp.dest('../take-it-easy/django_static/img'));

});


gulp.task('removedist', function () {
    return del.sync('dist');
});
gulp.task('clearcache', function () {
    return cache.clearAll();
});


gulp.task('default', ['watch']);

