import json
import os

import mwoauth
import yaml
from flask import Blueprint, Flask, request

from . import responses, routes, sessions
from ..database import DB


def configure(config):
    directory = os.path.dirname(os.path.realpath(__file__))

    app = Flask("wikilabels",
                template_folder=os.path.join(directory, 'templates'))
    app.config["APPLICATION_ROOT"] = config['wsgi']['application_root']

    bp = Blueprint('wikilabels', __name__,
                   static_folder=os.path.join(directory, 'static'))

    db = DB.from_config(config)

    form_filenames = (os.path.join(config['wsgi']['form_directory'], fn)
                      for fn in os.listdir(config['wsgi']['form_directory']))
    form_map = {d['name']:d for d in
                (yaml.load(open(fn)) for fn in form_filenames)}

    app = sessions.configure(app)

    consumer_token = mwoauth.ConsumerToken(config['oauth']['key'],
                                           config['oauth']['secret'])

    oauth = mwoauth.Handshaker(config['oauth']['mw_uri'], consumer_token)

    bp = routes.configure(config, bp, db, oauth, form_map)
    app.register_blueprint(bp, url_prefix=config['wsgi']['url_prefix'])

    return app
