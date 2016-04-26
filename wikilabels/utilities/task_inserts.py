"""
Creates an SQL loader script for a set of tasks by interpretting a TSV as JSON
blobs.

Usage:
    task_inserts -h | --help
    task_inserts <campaign-id> [--dry] [--config=<path>]

Options:
    -h --help             Prints this documentation
    <campaign-id>         The campaign that the tasks should be associated with
    --dry                 Whether it returns the SQL script or directly injects
                          to the database.
    --config=<path>       Path to a config directory to use when connecting
                          to the database [default: config/]
"""
import docopt
import glob
import json
import os
import sys
import yamlconf

from ..database import DB
from ..util import tsv


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    campaign_id = int(args['<campaign-id>'])

    rows = tsv.read(sys.stdin, header=True)

    dry = args['--dry']
    db = None
    if not dry:
        config_paths = os.path.join(args['--config'], "*.yaml")
        config = yamlconf.load(
            *(open(p) for p in sorted(glob.glob(config_paths))))
        db = DB.from_config(config)
    run(rows, campaign_id, db, dry)


def run(rows, campaign_id, db, dry):
    query = ("INSERT INTO task (campaign_id, data) VALUES"
             ",\n".join("  ({0}, '{1}')".format(campaign_id, json.dumps(row))
                        for row in rows))

    if dry:
        print(query)
        return
    if not db:
        raise RuntimeError('Database is not set, failing...')

    db.tasks.insert_tasks(rows, campaign_id)
