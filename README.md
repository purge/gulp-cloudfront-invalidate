# gulp-cloudfront-invalidate

> invalidates stream of files via cloudfront

## Install

    npm install gulp-cloudfront-invalidate --save-dev

## Usage

```js

var credentials = {
  "key": "xxx",
  "secret": "yyy",
  "region": "eu-west-1"
};

gulp.task('invalidate', () => {
  gulp.src("./dist/**/*.js")
      .pipe invalidate(credentials, { distId: 'YYYYYYYYYYYYYYY' })
})

```
