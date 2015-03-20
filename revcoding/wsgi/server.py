"""
WSGI Server

Starts a web server for hosting access to a set of scorers.

Usage:
    server (-h | --help)
    server [--port=<num>] [--verbose]

Options:
    -h --help        Print this documentation
    --port=<num>     The port number to start the server on [default: 8080]
    --verbose        Print logging information
"""
import docopt

from . import application


def main():
    args = docopt.docopt(__doc__)

    app = application.configure()

    app.run(host="0.0.0.0",
            port=int(args['--port']),
            debug=True)
