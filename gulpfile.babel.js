import gulp from 'gulp'
import sass from 'gulp-sass'
import gulpUtil from 'gulp-util'
import babelify from 'babelify'
import browserify from 'browserify'
import tildeImporter from 'node-sass-tilde-importer'
import source from 'vinyl-source-stream'

gulp.task('sass', () => {
    return gulp.src('./sass/seedsource.scss')
        .pipe(sass({importer: tildeImporter}).on('error', sass.logError))
        .pipe(gulp.dest('./seedsource_core/django/seedsource/static/css'))
})

gulp.task('js', () => {
    browserify({
        entries: './js/index.js',
        paths: ['./js'],
        extensions: ['.jsx']
    })
        .transform('babelify', {presets: ['es2015', 'react']})
        .bundle()
        .on('error', gulpUtil.log)
        .pipe(source('seedsource.js'))
        .pipe(gulp.dest('./seedsource_core/django/seedsource/static/js'))
})

gulp.task('default', ['sass', 'js'])

gulp.task('watch', () => {
    gulp.watch('./sass/seedsource.scss', ['sass'])
    gulp.watch('./js/**/*.{js,jsx}', ['js'])
})
