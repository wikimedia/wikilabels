"""
Creates a new campaign

Usage:
    new_campaign -h | --help
    new_campaign <wiki> <name> [--dry] [--form-name=<str>] [--config=<path>]
                 [--view=<str>] [--workset-size=<num>]

Options:
    -h --help             Prints this documentation
    <wiki>                Wiki database id, for example fawiki, dewiki, etc.
    <name>                Name of campaign, note that it will return error if
                          you define a duplicate name.
    --form-name=<str>     Name of the form [default: damaging_and_goodfaith]
    --view=<str>          View mode of diffs [default: DiffToPrevious]
    --workset-size=<num>  Size of a workset [default: 50]
    --dry                 Whether it returns the SQL script or directly injects
                          to the database.
    --config=<path>       Path to a config directory to use when connecting
                          to the database [default: config/]
"""
import docopt
import glob
import logging
import os
import yamlconf

from ..database import DB

logger = logging.getLogger(__name__)


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    wiki = args['<wiki>']
    name = args['<name>']
    dry = args['--dry']
    form_name = args['--form-name']
    diff_type = args['--view']
    workset_size = int(args['--workset-size'])
    db = None
    if not args['--dry']:
        config_paths = os.path.join(args['--config'], "*.yaml")
        config = yamlconf.load(
            *(open(p) for p in sorted(glob.glob(config_paths))))
        db = DB.from_config(config)
    run(wiki, name, dry, form_name, diff_type, workset_size, db)


def run_query(db, query):
    with db.transaction() as transactor:
        cursor = transactor.cursor()
        cursor.execute(query)
        for row in cursor:
            return row


def run(wiki, name, dry, form_name, diff_type, workset_size, db):
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
    if run_query(db, select_query):
        raise ValueError("A campaign named '{name}' in '{wiki}' already "
                         "exists, failing...".format(name=name, wiki=wiki))
    logger.info('Inserting a new campaign {name} in {wiki}'.format(
        name=name, wiki=wiki))
    res = run_query(query)
    if not res:
        raise RuntimeError('Could not make the campaign, please check '
                           'database logs')
    print(res)
