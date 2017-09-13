var fs = require('fs'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  pug = require('gulp-pug'),
  sass = require('gulp-sass'),
  csso = require('gulp-csso'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  plumber = require('gulp-plumber'),
  svgstore = require('gulp-svgstore'),
  svgmin = require('gulp-svgmin'),
  image = require('gulp-image'),
  cheerio = require('gulp-cheerio'),
  path = require('path'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  postcss = require('gulp-postcss'),
  notify = require("gulp-notify"),
  newer = require('gulp-newer'),
  flexibility = require('postcss-flexibility'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  concatCss = require('gulp-concat-css'),
  pump = require('pump');

var src = {
  root: 'src',
  jade: ['src/jade/**/*.pug'],
  jade_pages: ['src/jade/pages/*.pug', '!src/jade/pages/_*.pug'],
  sass: 'src/sass/*.scss',
  js: 'src/js/**/*.js',
  img: 'src/img/**/*',
  favicon: 'src/favicon/*',
  data: 'src/data/*.json',
  fonts: 'src/fonts/*',
  vendor: 'src/vendor/**/*'
};

var dest = {
  root: 'dist',
  css: 'dist/css/',
  js: 'dist/js',
  img: 'dist/img/',
  favicon: 'dist/favicon/',
  data: 'dist/data/',
  fonts: 'dist/fonts',
  vendor: 'dist/vendor'
};

gulp.task('jade', function () {
  var opt = JSON.parse(fs.readFileSync('src/options.json', {encoding: 'utf-8'}));

  pump([
    gulp.src(src.jade_pages),
    plumber(),
    pug({
      pretty: !opt.prod_ver,
      locals: {
        'production': opt.prod_ver,
        'scripts': opt.scripts,
        'nav': JSON.parse(fs.readFileSync('src/jade/components/nav/data.json', {encoding: 'utf-8'}))
      }
    }).on('error', gutil.log),
    gulp.dest(dest.root),
    notify("templates done")
  ]);

});

gulp.task('compress', function (cb) {
  var opt = JSON.parse(fs.readFileSync('src/options.json', {encoding: 'utf-8'})),
    scripts = opt.scripts;

  var arr = [];

  for (var i = 0; i < scripts.length; i++) {
    arr.push(src.root + scripts[i]);
  }

  console.log("compress", arr);

  pump([
      gulp.src(arr),
      concat('all_min.js'),
      uglify(opt.uglify),
      gulp.dest(dest.js)
    ],
    cb
  );
});

gulp.task('js', function () {
  var opt = JSON.parse(fs.readFileSync('src/options.json', {encoding: 'utf-8'}));

  pump([
    gulp.src(src.js),
    sourcemaps.init(),
    newer(dest.js),
    plumber(),
    gulp.dest(dest.js),
    notify("js done")
  ], function () {

    if (opt.prod_ver) {
      gulp.start('compress', function () {
        console.log('compress done');
      });
    }
  });
});

gulp.task('sass', function () {
  var opt = JSON.parse(fs.readFileSync('src/options.json', {encoding: 'utf-8'}));

  pump([
    gulp.src(src.sass),
    plumber(),
    sass(),
    autoprefixer('last 2 version', 'ie9'),
    postcss([flexibility]),
    gulp.dest(dest.css),
    notify("styles done")
  ], function () {

    if (opt.prod_ver) {
      gulp.start('csso', function () {
        console.log('csso done');
      });
    }
  });
});

gulp.task('csso', function () {
  var opt = JSON.parse(fs.readFileSync('src/options.json', {encoding: 'utf-8'})),
    arr = opt.styles;

  arr.push(dest.css + '**/*.css');

  console.log('csso', arr);

  pump([
    gulp.src(arr),
    concatCss('styles.min.css'),
    csso(),
    gulp.dest(dest.css)
  ]);

});

gulp.task('copy', function () {

  gulp.src([src.img, '!src/img/icons/sprite/*.svg'])
    .pipe(newer(dest.img))
    .pipe(gulp.dest(dest.img));
  gulp.src(src.fonts)
    .pipe(newer(dest.fonts))
    .pipe(gulp.dest(dest.fonts));
  gulp.src(src.data)
    .pipe(newer(dest.data))
    .pipe(gulp.dest(dest.data));
  gulp.src(src.vendor)
    .pipe(newer(dest.vendor))
    .pipe(gulp.dest(dest.vendor));
  gulp.src(src.favicon)
    .pipe(newer(dest.favicon))
    .pipe(gulp.dest(dest.favicon));
});

gulp.task('image', function () {
  pump([
    gulp.src(src.img),
    image(),
    gulp.dest(dest.img)
  ]);
});

gulp.task('svgstore', function () {
  return gulp.src('src/img/icons/sprite/*.svg')
    .pipe(svgmin(function (file) {
      var prefix = path.basename(file.relative, path.extname(file.relative));
      return {
        plugins: [{
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true
          }
        }]
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[style]').removeAttr('style');
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(svgstore())
    .pipe(gulp.dest('dist/img/icons/sprite/'));
});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: dest.root,
    port: 62200,
    ui: {
      port: 62201
    }
  });
});

gulp.task('dev', ['jade', 'sass', 'js', 'copy', 'browser-sync'], function () {
  gulp.watch(src.jade, ['jade']);
  gulp.watch(src.sass, ['sass']);
  gulp.watch(src.js, ['js']);
  gulp.watch(src.fonts, ['copy']);
  gulp.watch(src.data, ['copy']);
  gulp.watch(src.img, ['copy']);
});

gulp.task('default', ['dev']);
gulp.task('build', ['csso', 'image', 'compress']);
gulp.task('svg', ['svgstore']);
