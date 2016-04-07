"""
WSGI Server

Starts a web server for hosting access to a set of scorers.

Usage:
    server (-h | --help)
    server [--port=<num>] [--config=<path>] [--ssl] [--verbose]

Options:
    -h --help        Print this documentation
    --port=<num>     The port number to start the server on [default: 8080]
    --config=<path>  The path to a directory containing config files
                     [default: config/]
    --ssl            If set, run the server on ad-hoc SSL (https)
    --verbose        Print logging information
"""
import glob
import os.path

import docopt
import yamlconf

from ..wsgi import server


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    config_paths = os.path.join(args['--config'], "*.yaml")
    config = yamlconf.load(*(open(p) for p in sorted(glob.glob(config_paths))))

    if args['--ssl']:
        kwargs = {'ssl_context': "adhoc"}
    else:
        kwargs = {}

    app = server.configure(config)
    app.debug = True
    app.run(host="0.0.0.0",
            port=int(args['--port']),
            debug=True,
            **kwargs)
