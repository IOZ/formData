/**
 * Include plugins
 */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var header = require('gulp-header');
var notify = require('gulp-notify');
var pkg = require('./package.json');

/**
 * Base configuration
 */
var config = {
    scripts: {
        src: [
            'src/core.js',
            'src/validation-rules.js'
        ],
        dest: 'dest',
        file: 'formData.js',
        suffix: '.min',
        banner: true,
        notify: 'JS was compressed'
    }
};

if (config.scripts.banner) {
    config.scripts.banner = [
        '/**',
        ' * ${pkg.name} - ${pkg.description}',
        ' * @date - ${date}',
        ' * @version - ${pkg.version}',
        ' */\r\n'
    ].join('\n');
}

/**
 * Describe Gulp Tasks
 */

gulp.task('scripts', function() {
    gulp.src(config.scripts.src)
        .pipe(concat(config.scripts.file))
        .pipe(header(config.scripts.banner, { pkg: pkg, date: new Date()}))
        .pipe(gulp.dest(config.scripts.dest))
        .pipe(rename({
            'suffix' : config.scripts.suffix
        }))
        .pipe(uglify())
        .pipe(header(config.scripts.banner, { pkg: pkg, date: new Date()}))
        .pipe(gulp.dest(config.scripts.dest))
        .pipe(notify(config.scripts.notify));
});

/**
 * Watch tasks
 */
gulp.task('watch', function() {
    gulp.watch(config.scripts.src, ['scripts']);
});

/**
 * Invoke default tasks
 */
gulp.task('default', [
    'scripts',
    'watch'
]);
