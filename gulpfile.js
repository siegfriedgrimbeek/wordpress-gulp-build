//Requires
const gulp = require('gulp');
const util = require('gulp-util');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const modernizr = require('gulp-modernizr');
const runSequence = require('run-sequence');

const gulp = require('gulp');
const gutil = require('gulp-util');
const ftp = require( 'vinyl-ftp' );

//Vars
const input = 'sass/**/*.scss';
const output = './';
const reload = browserSync.reload;

const sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

const ftpDetails = {
  hostName: 'hostName',
  userName: 'userName',
  password: 'password'
}

// browser-sync task for starting the server.
gulp.task('browserSync', function() {
    //watch files
    var files = [
    './**/*.scss',
    './*.php',
    './js/*.js'
    ];

    //initialize browsersync
    browserSync.init(files, {
    //browsersync with a php server
    proxy: "localhost/jytteelfferich/",
    notify: false
    });
});

gulp.task('sass', function(){
    return gulp
    .src(input)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(concat('style.css'))
    .pipe(minifyCSS())
    // Write the resulting CSS in the output folder
    .pipe(gulp.dest(output))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('images', function(){
  return gulp.src('img/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('img'))
});

gulp.task('modernizr', function() {
  gulp.src('./js/*.js')
    .pipe(modernizr())
    .pipe(gulp.dest("js/"))
});

gulp.task('map', function () {
    return gulp.src('sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function (){
  gulp.watch(input, ['sass'])
 .on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');

    	var conn = ftp.create( {
        host: ftpDetails.hostName,
        user: ftpDetails.userName,
        password: ftpDetails.password,
    		parallel: 1,
    		log:gutil.log
    	} );

    	var globs = [
        './js/customizer.js',
        './style.css'
    	];

    	// using base = '.' will transfer everything to /public_html correctly
    	// turn off buffering in gulp.src for best performance

    	return gulp.src( globs, { base: '.', buffer: false } )
    		.pipe( conn.newer( '/public_html/jytteelfferich.com/wp-content/themes/photogenic/' ) ); // only upload newer files
    		.pipe( conn.dest( '/public_html/jytteelfferich.com/wp-content/themes/photogenic/' ) );
  })
})

gulp.task('build', function (callback) {
  runSequence(
    ['sass', 'images', 'modernizr','deploy' ],
    callback
  )
})

gulp.task('deploy', function () {
  var conn = ftp.create( {
    host: ftpDetails.hostName,
    user: ftpDetails.userName,
    password: ftpDetails.password,
    parallel: 1,
    log:gutil.log
  } );

  var globs = [
    './template-parts/*.php',
    './*.php',
    './js/*.js',
    './*.css'
  ];

  // using base = '.' will transfer everything to /public_html correctly
  // turn off buffering in gulp.src for best performance

  return gulp.src( globs, { base: '.', buffer: false } )
    .pipe( conn.newer( '/public_html/jytteelfferich.com/wp-content/themes/photogenic/' ) ); // only upload newer files
    .pipe( conn.dest( '/public_html/jytteelfferich.com/wp-content/themes/photogenic/' ) );
});

gulp.task('default', function (callback) {
  runSequence(['sass','map','browserSync', 'watch'],
    callback
  )
})
