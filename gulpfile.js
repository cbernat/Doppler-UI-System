// Require Gulp
var gulp = require('gulp'),
  // Require Gulp-sass plugin
  sass = require('gulp-sass'),
  // Sass globbing import for LibSass
  globbing = require('gulp-sass-glob'),
  // Require Sourcemaps
  sourcemaps = require('gulp-sourcemaps'),
  // Require Browser Sync for livereloading
  browserSync = require('browser-sync').create(),
  // Browser Reloading
  reload = browserSync.reload,
  // Require Del to clean dev folder
  del = require('del'),
  // Require Process HTML
  processHtml = require('gulp-processhtml'),
  // Require iconfont generator plugin
  iconfont = require('gulp-iconfont'),
  iconfontCss = require('gulp-iconfont-css'),
  // Require PostCSS
  postcss = require('gulp-postcss'),
  // Require PostCSS Flexibility
  flexibility = require('postcss-flexibility'),
  // Require PostCSS autoprefixer
  autoprefixer = require('autoprefixer'),
  // Require postCSS clean
  cleanCSS = require('gulp-clean-css'),
  // CSSO Plugin
  csso = require('gulp-csso'),
  // Require Css-MQpacker// Clean CSS
  mqpacker = require('css-mqpacker'),
  mqsorter = require('sort-css-media-queries'),
  // Image optimization plugin
  imagemin = require('gulp-imagemin'),
  // Concat plugin
  concat = require('gulp-concat'),
  // uglify plugin
  uglify = require('gulp-uglify'),
  // Console utility
  util = require("gulp-util");

// Project settings
var config = {
  // Folders for assets, development environment
  folderDev: {
    base: 'dev',
    css: 'dev/css',
    fonts: 'dev/fonts',
    images: 'dev/img',
    js: 'dev/js'
  }, // If this path gets changed, remember to update .gitignore with the proper path to ignore images and css
  folderAssets: {
    base: 'assets',
    fonts: 'assets/fonts',
    styles: 'assets/styles',
    images: 'assets/img',
    js: 'assets/js'
  },
  folderDist: {
    base: 'dist',
    css: 'dist',
    fonts: 'dist/fonts',
    images: 'dist/img',
    js: 'dist'
  },
  postCSS: {
    processors: [
      autoprefixer({
        browsers: [
          // 'Android >= 2.3',
          // 'BlackBerry >= 7',
          // 'Chrome >= 9',
          // 'Firefox >= 4',
          // 'Explorer >= 9',
          // 'iOS >= 5',
          // 'Opera >= 11',
          // 'Safari >= 5',
          // 'OperaMobile >= 11',
          // 'OperaMini >= 6',
          // 'ChromeAndroid >= 9',
          // 'FirefoxAndroid >= 4',
          // 'ExplorerMobile >= 9',
          'last 2 versions',
          '> 1%',
          'last 3 iOS versions',
          'Firefox > 20',
          'ie 9' //This is a Default Autoprefixer Config. In case that you need to add other browser support uncomment from above.
        ]
      }),
      mqpacker({
        sort: mqsorter
      })
    ]
  }
};

// Sass tasks are divided for performance issues regarding dependencies
// Sass Build task definition, only ran once
gulp.task('sass:build', ['webfont'], function() {
  return gulp.src(config.folderAssets.styles + '/styles.scss')
    .pipe(globbing({
      // Configure it to use SCSS files
      extensions: ['.scss']
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(config.postCSS.processors))
    .pipe(cleanCSS({
      advanced: true
    }))
    .pipe(csso())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDev.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// Sass Watch task definition
gulp.task('sass', function() {
  return gulp.src(config.folderAssets.styles + '/styles.scss')
    .pipe(globbing({
      // Configure it to use SCSS files
      extensions: ['.scss']
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(config.postCSS.processors))
    .pipe(cleanCSS({
      advanced: true
    }))
    .pipe(csso())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDev.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// CSS copy to dist folder
gulp.task('copy:css', ['sass:build'], function() {
  return gulp.src(config.folderDev.css + '/*.*')
    .pipe(gulp.dest(config.folderDist.css));
});

// Browser Sync task definition
gulp.task('serve', ['build'], function() {
  return browserSync.init({
    port: 3500,
    server: {
      baseDir: config.folderDev.base
    },
    ui: {
      port: 3501
    }
  });
});


// Process HTML task definition
gulp.task('processHtml', function() {
  return gulp.src(config.folderAssets.base + '/templates/*.html')
    .pipe(processHtml({
      recursive: true,
      environment: 'dev'
    }))
    .pipe(gulp.dest(config.folderDev.base))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// Process HTML task definition for distribution purposes
gulp.task('processHtml:dist', function() {
  return gulp.src(config.folderAssets.base + '/templates/*.html')
    .pipe(processHtml({
      recursive: true,
      environment: 'dist'
    }))
    .pipe(gulp.dest(config.folderDist.base));
});

// Generate webfonts
gulp.task('webfont', ['webfont:copy'], function() {
  return del([config.folderDev.fonts + '/*.scss']);
});

gulp.task('webfont:copy', ['webfont:generate'], function() {
  return gulp.src([config.folderDev.fonts + '/_icon-font.scss'])
    .pipe(gulp.dest(config.folderAssets.styles + '/libs/iconfont/'));
});

gulp.task('webfont:generate', function() {
  var fontName = 'icon-font';
  return gulp.src([config.folderAssets.base + '/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      fontPath: '../fonts/',
      path: config.folderAssets.styles + '/libs/iconfont/gulp-icontemplate.css',
      targetPath: '_icon-font.scss'
    }))
    .pipe(iconfont({
      fontName: fontName,
      formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
      normalize: true,
      fontHeight: 1001
    }))
    .pipe(gulp.dest(config.folderDev.fonts));
});

// Copy webfonts to Dist folder
gulp.task('copy:fonts', ['sass:build'], function() {
  return gulp.src(config.folderDev.fonts + '/*.*')
    .pipe(gulp.dest(config.folderDist.fonts));
});

// Optimize JS
gulp.task('js:dist', function() {
  return gulp.src([config.folderAssets.js + '/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('app.js', {
      newLine: "\r\n;"
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.folderDist.js));
});

// Copy Vendors
gulp.task('copy:vendors', function() {
  return gulp.src([config.folderAssets.js + '/vendors/*.js'])
    .pipe(concat('vendors.js', {
      newLine: "\r\n;"
    }))
    .pipe(gulp.dest(config.folderDev.js));
});

//Copy JS
gulp.task('copy:js', ['copy:vendors'], function() {
  return gulp.src([config.folderAssets.js + '/*.js'])
    .pipe(concat('main.js', {
      newLine: "\r\n;"
    }))
    .pipe(gulp.dest(config.folderDev.js));
});

// Optimize Images
gulp.task('images:dist', function() {
  return gulp.src([config.folderAssets.images + '/**/*'])
    .pipe(imagemin({
      optimizationLevel: 5,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: true
      }]
    }))
    .pipe(gulp.dest(config.folderDist.images));
});

// Copy Images
gulp.task('copy:images', function() {
  return gulp.src([config.folderAssets.images + '/**/*'])
    .pipe(gulp.dest(config.folderDev.images));
});

// Delete dev folder for cleaning
gulp.task('clean', ['clean:dev']);

gulp.task('clean:dev', function() {
  return del.sync(config.folderDev.base);
});

// Watch for changes
gulp.task('run', ['clean', 'serve'], function() {
  gulp.watch(config.folderAssets.base + '/**/*.scss', ['sass']);
  gulp.watch(config.folderAssets.base + '/icons/*.svg', ['webfont']);
  gulp.watch(config.folderAssets.images + '/**/*.*', ['copy:images']);
  gulp.watch(config.folderAssets.js + '/*', ['copy:js']);
  gulp.watch(config.folderAssets.base + '/templates/*.html', ['processHtml']);
  gulp.watch(config.folderDev.js + '/*.js').on('change', browserSync.reload);
});

// Watch for changes
gulp.task('watch', ['build'], function() {
  gulp.watch(config.folderAssets.base + '/**/*.scss', ['sass']);
});

// Define Dist generation task (Deploy)
gulp.task('dist', ['copy:css', 'copy:fonts', 'js:dist', 'processHtml:dist', 'images:dist']);

// Define build task
gulp.task('build', ['sass:build', 'copy:js', 'processHtml', 'copy:images']);
