import json
import os

import mwoauth
import yaml
from flask import Blueprint, Flask, request

from . import responses, routes, sessions
from .database import DB


def configure(config):
    app = Flask("revcoding")
    app.config["APPLICATION_ROOT"] = config['application_root']
    
    bp = Blueprint('revcoding', __name__)

    db = DB.from_config(config)

    form_filenames = (os.path.join(config['form_directory'], fn)
                      for fn in os.listdir(config['form_directory']))
    form_map = {d['name']:d for d in
                (yaml.load(open(fn)) for fn in form_filenames)}

    app = sessions.configure(app)

    consumer_token = mwoauth.ConsumerToken(config['oauth']['key'],
                                           config['oauth']['secret'])

    oauth = mwoauth.Handshaker(config['oauth']['mw_uri'], consumer_token)

    bp = routes.configure(config, bp, db, oauth, form_map)
    app.register_blueprint(bp, url_prefix=config['application_root'])

    return app
