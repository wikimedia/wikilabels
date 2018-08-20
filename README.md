[![Build Status](https://travis-ci.org/wikimedia/wikilabels.svg?branch=master)](https://travis-ci.org/wikimedia/wikilabels)
[![codecov](https://codecov.io/gh/wikimedia/wikilabels/branch/master/graph/badge.svg)](https://codecov.io/gh/wikimedia/wikilabels)

# Wiki Labels
This package provides the components of a generalized labeling service for
MediaWiki.  There are two primary components, a user script to be used on
MediaWiki and a flask server for the gadget to converse with.  


## Server
The flask server is intended to be hosted by a web server, but if you wish you can run a dev server (see Dev server section for details)

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

Copy-paste `wikilabels/database/schema.sql` into the command prompt.

Optionally, you can also load sample data into the database by copy-pasting `wikilabels/database/schema-testdata.sql` into the command prompt

### Starting the dev server
Run the following command in the base repository (e.g. wikilabels-master).

    $ wikilabels dev_server
## Reporting Bugs
To report a bug, please use [Phabricator](https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?projects=Wikilabels)
## See also
* [meta:Wiki labels](https://meta.wikimedia.org/wiki/Wiki_labels)
