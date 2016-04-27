"""
Inserts a set of tasks into a campaign

Usage:
    load_tasks -h | --help
    load_tasks <campaign-id> [--config=<path>]

Arguments:
    <campaign-id>  The campaign that the tasks should be associated with

Options:
    -h --help        Prints this documentation
    --config=<path>  Path to a config directory to use when connecting
                     to the database [default: config/]
"""
import glob
import json
import logging
import os
import sys

import docopt
import yamlconf

from ..database import DB, NotFoundError

logger = logging.getLogger(__name__)


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    campaign_id = int(args['<campaign-id>'])

    tasks = (json.loads(line) for line in sys.stdin)

    config_paths = os.path.join(args['--config'], "*.yaml")
    config = yamlconf.load(
        *(open(p) for p in sorted(glob.glob(config_paths))))
    db = DB.from_config(config)
    run(db, campaign_id, tasks)


def run(db, campaign_id, tasks):

    # Confirm that campaign exists
    try:
        db.campaigns.get(campaign_id)
    except NotFoundError as e:
        logger.error(e)
        return

    # Load tasks into campaign
    db.tasks.load(tasks, campaign_id)
