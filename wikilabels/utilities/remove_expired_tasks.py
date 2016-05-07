"""
Remove incomplete tasks from expired worksets.

Usage:
    remove_expired_tasks -h | --help
    remove_expired_tasks [--config=<path>]

Options:
    -h --help        Prints this documentation
    --config=<path>  Path to a config directory to use when connecting
                     to the database [default: config/]
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

    config_paths = os.path.join(args['--config'], "*.yaml")
    config = yamlconf.load(
        *(open(p) for p in sorted(glob.glob(config_paths))))
    db = DB.from_config(config)
    run(db)


def run(db):

    db.tasks.remove_expired_tasks()
