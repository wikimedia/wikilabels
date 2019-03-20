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
    
### Creating a new view 
The following example shows the steps that are needed to create a new view, e.g. `MultiDiffToPrevious`
+ Create a campaign using `$ wikilabels new_campaign {campaignName} {labelForm} {youNewViewName} {labelsPerTask} {tasksPerWorkSet}`
+ Find the `campaign_id` that is given to your new campaign and remember it for later.
+ Make some test data in json-lines format. Each json line is the data that will be available to your view and will probably contain the ids of with which to hit an API.
+ Insert your test data with `wikilabels task_inserts {campaign_id} < example_sessions_data_enwiki.json` 
+ Now modify  `wikilabels/wikilabels/wsgi/static/js/wikiLabels/views.js` to create your new view.
    + You need to implement the following functions at least: `.load` and `.present`.
    + Add your new view to the `WL.views` object at the end with key the same name as `{yourNewViewName}`.
    + Tip: because the javascript gets "packed" as useful way to debug your new view is through the `debugger` javascript keyword.
    
#### Discussion on what content to display in a view.
We want to derive as "unbiased" as possible a label from each task. Sometimes this means providing less infromation to the labeller rather than more.
For instance, in showing a "diff" to the labeller, while it might be tempting to display the editor's username, this may invoke a bias. A username can a persona: anonymity or gender or age, then a labeller might use this persona as a heuristic to judge the difference. In order to observe the "diff" and not labeller's opinion of the username, it might be good to blind the labeller from the editor's username.
Likewise the timestamp of the diff could also be used a heuristic to judge the editor not the edit. Still perhaps in some cases it might be legitmate to provide extra context to assist the labeller if it does not bias them. 

## Reporting Bugs
To report a bug, please use [Phabricator](https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?projects=Wikilabels)
## See also
* [meta:Wiki labels](https://meta.wikimedia.org/wiki/Wiki_labels)
