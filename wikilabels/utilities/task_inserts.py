"""
Creates an SQL loader script for a set of tasks by interpretting a TSV as JSON
blobs.

Usage:
    task_inserts -h | --help
    task_inserts <campaign-id>

Options:
    -h --help      Prints this documentation
    <campaign-id>  The campaign that the tasks should be associated with
"""
import json
import sys

import docopt

from ..util import tsv


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    campaign_id = int(args['<campaign-id>'])

    rows = tsv.read(sys.stdin, header=True)

    run(rows, campaign_id)


def run(rows, campaign_id):
    print("INSERT INTO task (campaign_id, data) VALUES")
    print(",\n".join("  ({0}, '{1}')".format(campaign_id, json.dumps(row))
          for row in rows) + ";")
