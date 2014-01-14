# Flickr Photography Portfolio Site

### Description

This is a photography portfolio site that pulls sets and photos from a Flickr user using the Flickr API. **It's still in development and not ready for live use.**

### Setup

Copy `config.json.sample` to `config.json` and populate with appropriate values. Set the server's document root for to the `build/` directory. Then run the grunt build script to build the site.

### Build Script

The build script depends on Node JS and Grunt. Once you have node installed run `npm install -g grunt-cli` to install the grunt command line interface.

From the root directory of the project run `grunt build` to build the site.

Run `grunt dev` to build a non-minified or concatanated version. It also sets up a watch task to automatically build whenever a file is modified.

The `--dev` option builds using the dev config options.

##### Flickr API Javascript Wrapper

The `scripts/flickr.js` file could be used independantly as a javascript helper/wrapper for the the Flickr API.

---

Built by Avinoam Henig
