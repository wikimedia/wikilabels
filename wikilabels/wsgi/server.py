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
                static_url_path="/BASE_STATIC",  # No conflict with blueprint
                template_folder=os.path.join(directory, 'templates'))
    app.config["APPLICATION_ROOT"] = config['wsgi']['application_root']
    bp = Blueprint('wikilabels', __name__,
                   static_folder=os.path.join(directory, 'static'))

    db = DB.from_config(config)

    form_directory = config['wikilabels']['form_directory']
    form_i18n_directory = config['wikilabels']['form_i18n_directory']
    form_filenames = (os.path.join(form_directory, fn)
                      for fn in os.listdir(form_directory))
    form_map = {}
    for fn in form_filenames:
        form_name = os.path.splitext(os.path.basename(fn))[0]
        form_map[form_name] = yaml.load(open(fn))
    for form_name in form_map:
        i18n_dir = os.path.join(form_i18n_directory, form_name)
        form_map[form_name]['i18n'] = (
            {lang[:-5]: json.load(open(os.path.join(i18n_dir, lang)))
                for lang in os.listdir(i18n_dir)}
        )
    app = sessions.configure(app)

    oauth_config = yaml.load(open(config['oauth']['creds']))

    consumer_token = mwoauth.ConsumerToken(oauth_config['key'],
                                           oauth_config['secret'])

    oauth = mwoauth.Handshaker(config['oauth']['mw_uri'], consumer_token)

    bp = routes.configure(config, bp, db, oauth, form_map)
    app.register_blueprint(bp, url_prefix=config['wsgi']['url_prefix'])

    return app
