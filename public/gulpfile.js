var gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    livereload = require('gulp-livereload'),
    gulp = require('gulp'),
    babel = require('gulp-babel');;

gulp.task('sass', function() {
    console.log('reloading because of changed sass');
    return gulp.src('./css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'))
        .pipe(livereload());
});

gulp.task('htmlWatch', function() {
    console.log('reload because of changed html');
    return gulp.src('./index.html')
        .pipe(livereload());
});

gulp.task('jsWatch', function() {
    console.log('reload because of changed js');
    return gulp.src('./js/main.js')
        .pipe(livereload());
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('./css/*.scss', ['sass']);
    gulp.watch('./index.html', ['htmlWatch']);
    // gulp.watch('./js/custom/toBabel/*.js', ['babel']);
    gulp.watch('./js/custom/*.js', ['lint', 'process-scripts']);
    gulp.watch('./js/main.js', ['jsWatch']);
});


gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('babel', function() {
    gulp.src('js/custom/toBabel/atemplate.js')
        // .pipe(concat('babeled.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('js/custom/'));
    return;
});

gulp.task('lint', function() {

    gulp.src('js/custom/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

    return;

});


gulp.task('process-scripts', function() {
    //Includes: concat, minify  
    // 


    //templates file 
    gulp.src('js/custom/*.js').
        //concatenate all the js files
    pipe(concat('main.js')).
        //run the code through babel
    pipe(babel({
            presets: ['es2015']
        })).
        //place the result to a new directory 
    pipe(gulp.dest('js/')).
        //rename to have the .min suffix 
    pipe(rename({ suffix: '.min' })).
        //uglify 
    pipe(uglify()).
        ////place the result to a new directory 
    pipe(gulp.dest('js/'));




    return;

});
