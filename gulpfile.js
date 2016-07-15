var gulp = require('gulp'),
    notify = require("gulp-notify"),
    bower_install = require('gulp-bower');

var config = {
  bowerDir: function (path) {
    return './bower_components' + (path || '');
  },
  staticDir: function (path) {
    return './static' + (path || '');
  }
}

gulp.task('bower_install', function () {
  bower_install().pipe(
    gulp.dest(config.bowerDir())
  );
});

gulp.task('bower_deploy', function () {
  var lib_files = [
    config.bowerDir('/select2/dist/js/select2.min.js'),
    config.bowerDir('/bootstrap/dist/js/bootstrap.min.js'),
    config.bowerDir('/jquery/dist/jquery.min.js'),
    config.bowerDir('/select2/dist/css/select2.min.css'),
    config.bowerDir('/bootstrap/dist/css/bootstrap.min.css'),
    config.bowerDir('/font-awesome/css/font-awesome.min.css')
  ];
  gulp.src(lib_files)
    .pipe(gulp.dest(config.staticDir('/lib')));

  var font_files = [
    config.bowerDir('/font-awesome/fonts/fontawesome-webfont.woff2'),
    config.bowerDir('/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2'),
    config.bowerDir('/font-awesome/fonts/fontawesome-webfont.svg'),
    config.bowerDir('/bootstrap/dist/fonts/glyphicons-halflings-regular.svg')
  ]
  gulp.src(font_files)
    .pipe(gulp.dest(config.staticDir('/fonts')));
});

gulp.task('serve', function () {
  var live = require('gulp-connect'),
      proxy = require('http-proxy-middleware'),
      server = live.server({
        port: 8081,
        root: ['./static/app'],
        middleware: function(connect, opt) {
          return [
            proxy('/api', {
              target: 'http://127.0.0.1:8080',
              changeOrigin: true
            })
          ];
        }
      });
  gulp.watch(['static/app/**/*.css', 'static/app/**/*.html', 'static/app/**/*.js']);
});

gulp.task('default', ['bower_install', 'bower_deploy']);
