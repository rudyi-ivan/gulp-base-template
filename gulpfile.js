'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    jade = require('gulp-jade'),
    merge = require('merge-stream'),
    minifyCss = require('gulp-minify-css'),
    prefix = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    spritesmith = require('gulp.spritesmith'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch');

var paths = {
  src: {
    images:     ['./application/images/*'],
    scripts:    ['./application/scripts/*.js'],
    sprites:    ['./application/icons/*'],
    styles:     ['./application/styles/*.scss'],
    templates:  ['./application/templates/*.jade']
  },
  dest: {
    build:      'public',
    images:     'public/images',
    scripts:    'public',
    sprites:    {
      css: './application/styles', 
      img: './application/images'
    },
    styles:     'public',
    templates:  'public/templates'
  }
}

var options = {
  build: {
    minCssName: 'app.min.css',
    minJsName: 'app.min.js',
    tasks: [
      'build:images',
      'build:scripts',
      'build:styles',
      'build:templates'
    ]
  },
  spritesmith: {
    cssName: 'sprite.scss',
    imgName: 'sprite.png',
    imgPath: './images/sprite.png'
  },
  autoprefixer: {
    browsers: ['last 2 version'],
    cascade: false
  }
};

// watch
gulp.task('watch', function() {
  var tasks = options.build.tasks;
  for(var index in tasks) {
    (function() {
      var taskName = tasks[index].replace('build:', '');
      watch(paths.src[taskName], function() {
        return gulp.start('build:' + taskName);
      });
    }());
  }

  watch(paths.src.sprites, function() {
    return gulp.start('build:sprites');
  });
});

// build
gulp.task('build', options.build.tasks);

gulp.task('build:images', ['clean:build:images'], function() {
  return gulp.src(paths.src.images)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.dest.images));
});

gulp.task('build:scripts', function() {
  return gulp.src(paths.src.scripts)
    .pipe(sourcemaps.init())
    .pipe(concat(options.build.minJsName))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest.scripts));
});

gulp.task('build:sprites', function() {
  var spriteStream = gulp.src(paths.src.sprites)
    .pipe(spritesmith(options.spritesmith));

    spriteStream.img
      .pipe(gulp.dest(paths.dest.sprites.img));

    spriteStream.css
      .pipe(gulp.dest(paths.dest.sprites.css));

    return merge(spriteStream.img, spriteStream.css);
});

gulp.task('build:styles', function() {
  return gulp.src(paths.src.styles)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(prefix(options.autoprefixer))
    .pipe(concat(options.build.minCssName))
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest.styles));
});

gulp.task('build:templates', ['clean:build:templates'], function() {
  return gulp.src(paths.src.templates)
    .pipe(jade())
    .pipe(gulp.dest(paths.dest.templates));
});

// clean
gulp.task('clean:build', function() {
  return del([paths.dest.build]);
});

gulp.task('clean:build:images', function() {
  return del([paths.dest.images]);
});

gulp.task('clean:build:templates', function() {
  return del([paths.dest.templates]);
});

gulp.task('clean:sprites', function() {
  return del([
    paths.dest.sprites.css+'/'+options.spritesmith.cssName,
    paths.dest.sprites.img+'/'+options.spritesmith.imgName
  ]);
});