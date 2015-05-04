# Wiki Labels
This package provides the components of a generalized labeling service for
MediaWiki.  There are two primary components, a user script to be used on
MediaWiki and a flask server for the gadget to converse with.  


## Server
The flask server is intended to be hosted by a web server, but a dev server can
be started locally with
`wikilabels dev_server --config config/wikilabels-localdev.yaml`

### Installation


#### Dependencies
Installation will require some additional packages to be available.

  `sudo apt-get install postgresql-server-dev-all postgresql libffi-dev npm g++ python3-dev libmemcached-dev`

#### Database setup
You'll need to create a `wikilabels` user and database. Here's a sequence of
commands that works on a fresh install of postgres (note that `sudo` rights
will be required).

Create a wikilabels user
    $ sudo useradd wikilabels

Switch to `postgres` user to run commands
    $ sudo su postgres
    $ psql
    postgres=# CREATE USER wikilabels WITH PASSWORD 'something secure';
    postgres=# CREATE DATABASE wikilabels;
    postgres=# GRANT ALL PRIVILEGES ON DATABASE wikilabels to wikilabels;
    postgres=# \q
    $ exit

Switch to `wikilabels` user to load schema
    $ sudo su wikilabels
    $ psql

Copy-paste config/schema.sql into the command prompt.

Optionally, you can also load sample data into the database by copy-pasting config/schema-testdata.sql into the command prompt

### Starting the dev server

    $ wikilabels dev_server --config config-localdev.yaml

## Gadget

1. Go to one of the js subpages of your user page. You can choose a page such as these:
  * [meta:User:`<Name>`/global.js](https://meta.wikimedia.org/wiki/Special:MyPage/global.js), which will be loaded in all wikis, in all skins
  * [meta:User:`<Name>`/common.js](https://meta.wikimedia.org/wiki/Special:MyPage/common.js), which will be loaded only on Meta-wiki, in all skins
  * [meta:User:`<Name>`/vector.js](https://meta.wikimedia.org/wiki/Special:MyPage/vector.js), which will be loaded only on Meta-wiki, in the vector skin
2. Copy the following to the page you have chosen:

  ```javascript
  // [[File:User:EpochFail/WikiLabels.js]] (workaround for [[phab:T35355]])
  mw.loader.load( '//labels.wmflabs.org/gadget/loader.js' );
  ```

3. Clear the cache of your browser.

This will import a live copy of the javascript.

## See also
* [meta:Wiki labels](https://meta.wikimedia.org/wiki/Wiki labels)
