# Flickr Photography Portfolio Site

### Description

This is a photography portfolio site that pulls sets and photos from Flickr. **It's still in development and not ready for production use.**

### Setup

Copy `config.json.sample` and name it `config.json`. This is the config file. Populate it with the appropriate values for your site. The `default` configuration object is used by default. You can create your own custom configuration objects (see sample `dev` object for an example) that will override the default options. You can build using different configuration objects with the `--config=configObjectName` option.

The web server's document root should point to the `build/` directory within the project.

### Build

The build script compiles and processes all the files and places the result in the `build` directory. It relies on Node JS and Grunt.

Once you have Node and the Grunt CLI installed you can run `grunt build` from the root directory of the project.

Run `grunt dev` to build a non-minified or concatanated version. It also sets up a watch task to automatically build whenever a file is modified.

The optional `--config` option builds using custom configuration objects to override the default options.

##### Flickr API Angular Javascript Wrapper

The `scripts/flickr.js` file could be used independantly as an angular module for using the Flickr API.
