"""
WSGI Server

Starts a web server for hosting access to a set of scorers.

Usage:
    server (-h | --help)
    server [--port=<num>] [--verbose] [--config=<path>]

Options:
    -h --help        Print this documentation
    --port=<num>     The port number to start the server on [default: 8080]
    --config=<path>  The path to a yaml config file
                     [default: config/wikilabels-localdev.yaml]
    --verbose        Print logging information
"""
import docopt

import yamlconf

from ..wsgi import server


def main(argv=None):
    args = docopt.docopt(__doc__, argv=argv)

    if args['--config'] is not None:
        config = yamlconf.load(open(args['--config']))
        # FIXME: DON'T DO THIS
        db_config = config['database']['config']
        config['database'] = yamlconf.load(open(db_config))
    else:
        config = None

    app = server.configure(config)
    app.debug = True
    app.run(host="0.0.0.0",
            port=int(args['--port']),
            debug=True,
            ssl_context="adhoc")
