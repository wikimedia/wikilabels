"""
Creates a new campaign

Usage:
    new_campaign -h | --help
    new_campaign <wiki> <name> <form> <view> <labels-per-task>
                 <tasks-per-assignment> [--config=<path>]

Arguments:
    <wiki>                  Wiki database id, for example fawiki, dewiki, etc.
    <name>                  Name of campaign, note that it will return error if
                            you define a duplicate name.
    <form>                  The name of the form
    <view>                  The view for tasks
    <labels-per-task>       The number times a task can be assigned to
                            different labelers
    <tasks-per-assignment>  The number of tasks assigned per workset

Options:
    -h --help               Prints this documentation
    --config=<path>         Path to a config directory to use when connecting
                            to the database [default: config/]
    --force                 Ignore name clashes when creating the campaign
"""
import glob
import logging
import os

import docopt
import yamlconf

from ..database import DB

logger = logging.getLogger(__name__)


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    wiki = args['<wiki>']
    name = args['<name>']
    form = args['<form>']
    view = args['<view>']
    labels_per_task = args['<labels-per-task>']
    tasks_per_assignment = args['<tasks-per-assignment>']
    config_paths = os.path.join(args['--config'], "*.yaml")
    config = yamlconf.load(*(open(p) for p in
                             sorted(glob.glob(config_paths))))
    db = DB.from_config(config)
    run(db, wiki, name, form, view, labels_per_task, tasks_per_assignment,
        force)


def run(db, wiki, name, form, view, labels_per_task, tasks_per_assignment,
        force):
    query = ("INSERT INTO campaign (name, wiki, form, view, created, "
             "labels_per_task, tasks_per_assignment, active) VALUES "
             "(`{name}`, `{wiki}`, `{c_type}`, `{d_type}`, NOW(), 1, "
             "{num}, True);")
    query = query.format(name=name, wiki=wiki, c_type=form_name,
                         d_type=diff_type, num=workset_size)
    if dry:
        print(query)
        return
    if not db:
        raise RuntimeError('Database is not set, failing...')
    select_query = ("SELECT * FROM campaign WHERE name = `{name}`"
                    "and wiki = `{wiki}`")
    select_query = select_query.format(name=name, wiki=wiki)
    if db_util.run_query(db, select_query):
        raise ValueError("A campaign named '{name}' in '{wiki}' already "
                         "exists, failing...".format(name=name, wiki=wiki))
    logger.info('Inserting a new campaign {name} in {wiki}'.format(
        name=name, wiki=wiki))
    res = db_util.run_query(query)
    if not res:
        raise RuntimeError('Could not make the campaign, please check '
                           'database logs')
    print(res)
