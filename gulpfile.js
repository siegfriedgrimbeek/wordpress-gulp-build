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
const ftp = require( 'vinyl-ftp' );
const babel = require('gulp-babel');

//CSS
const cssInput = 'sass/**/*.scss';
const cssOutput = './';

const sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

//JS
const jsInput = './js/*.js';
const jsOutput = 'js/';

//img
const imgInput = 'img/**/*.+(png|jpg|jpeg|gif|svg)';
const imgOutput = 'img/'

//Variables
const reload = browserSync.reload;

const ftpDetails = {
  hostName: 'hostName',
  userName: 'userName',
  password: 'password',
  directory: '/public_html/jytteelfferich.com/wp-content/themes/photogenic/'
}

//BrowserSync Settings
const browserSyncSettings = {
  files:[
    cssInput,
    jsInput,
    './*.php'
  ],
  proxy: "localhost/jytteelfferich/",
  notify: false
}

// browser-sync task for starting the server.
gulp.task('browserSync', () => {
    //initialize browsersync
    browserSync.init(browserSyncSettings.files, {
    //browsersync with a php server
    proxy: browserSyncSettings.proxy,
    notify: browserSyncSettings.false
    });
});


//Compile Sass
gulp.task('sass', () => {
    return gulp
    .src(cssInput)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(concat('style.css'))
    .pipe(minifyCSS())
    // Write the resulting CSS in the output folder
    .pipe(gulp.dest(cssOutput))
    .pipe(browserSync.reload({
      stream: true
    }))
});

//Compile JS
gulp.task('js', () =>
    gulp.src(jsInput)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env'],
            minified: true
        }))
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(jsOutput))
);

//Minify Images
gulp.task('images', () => {
  return gulp.src(imgInput)
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest(imgOutput))
});

//Create modernizr
gulp.task('modernizr', () => {
  gulp.src(jsInput)
    .pipe(modernizr())
    .pipe(gulp.dest(jsOutput))
});


gulp.task('map', () => {
    return gulp.src(cssInput)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(cssOutput));
});

//Watch for changes
gulp.task('watch', () => {
  gulp.watch(cssInput, ['sass'])
 .on('change', (event) => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  })
})

//Build Task
gulp.task('build', (callback) => {
  runSequence(
    ['sass', 'images', 'modernizr','deploy' ],
    callback
  )
})

//Deploy Task
gulp.task('deploy', () => {
  const conn = ftp.create( {
    host: ftpDetails.hostName,
    user: ftpDetails.userName,
    password: ftpDetails.password,
    parallel: 1,
    log:util.log
  });

  let globs = [
    './template-parts/*.php',
    './*.php',
    './js/*.js',
    './*.css'
  ];

  return gulp.src( globs, { base: '.', buffer: false } )
    .pipe( conn.newer( ftpDetails.directory ) )
    .pipe( conn.dest( ftpDetails.directory ) );
});

//Default Task
gulp.task('default', (callback) => {
  runSequence(['sass','map','browserSync', 'watch'],
    callback
  )
})
