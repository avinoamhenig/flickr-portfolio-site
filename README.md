# Flickr Photography Portfolio Site

### Description

This is a photography portfolio site that pulls sets and photos from a Flickr user using the Flickr API. **It's still in development and not ready for production use.**

### Setup

Copy `config.json.sample` and name it `config.json`; this is the config file. Populate it with the appropriate values for your site. Any properties in the `dev` object will override the default config properties when the `--dev` build option is specified.

The web server's document root should point to the `build/` directory within the project.

### Build

The build script compiles and processes all the files and puts them in the `build/` directory. It uses Node JS and Grunt. Once you have node installed run `npm install -g grunt-cli` to install the grunt command line interface.

From the root directory of the project run `grunt build` to build the site.

Run `grunt dev` to build a non-minified or concatanated version. It also sets up a watch task to automatically build whenever a file is modified.

The `--dev` option builds using the dev config options.

##### Cache-busting

The build script prepends a string to the beginning of css and javascript files that corresponds to the date modified. This ensures that new versions of the file are not loaded from the browser's cache. This also enables you to set very long expires headers for those files in order to improve load time.

##### Flickr API Javascript Wrapper

The `scripts/flickr.js` file could be used independantly as a javascript helper/wrapper for the the Flickr API.
