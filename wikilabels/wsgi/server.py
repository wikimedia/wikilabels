import json
import os

import flask_oojsui
import mwoauth
import yaml
from flask import Blueprint, Flask
from flask.ext.cors import CORS
from flask_assets import Environment, Bundle
from jsmin import jsmin  # noqa
from cssmin import cssmin  # noqa

from . import routes, sessions
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

    consumer_token = mwoauth.ConsumerToken(config['oauth']['key'],
                                           config['oauth']['secret'])

    oauth = mwoauth.Handshaker(config['oauth']['mw_uri'], consumer_token)

    bp = routes.configure(config, bp, db, oauth, form_map)
    CORS(bp, origins=config['wsgi'].get('cors_allowed', '*'),
         supports_credentials=True)
    app.register_blueprint(bp, url_prefix=config['wsgi']['url_prefix'])

    # Bundle and minify static assets
    assets = Environment(app)
    js_assets = [
        "lib/date-format/date-format.js",
        "lib/strftime/strftime.js",
        "js/oo.util.js",
        "js/oo.ui.SemanticOperationsSelector.js",
        "js/oo.ui.SemanticsSelector.js",
        "js/wikiLabels/wikiLabels.js",
        "js/wikiLabels/api.js",
        "js/wikiLabels/config.js",
        "js/wikiLabels/Form.js",
        "js/wikiLabels/Home.js",
        "js/wikiLabels/i18n.js",
        "js/wikiLabels/server.js",
        "js/wikiLabels/user.js",
        "js/wikiLabels/util.js",
        "js/wikiLabels/views.js",
        "js/wikiLabels/Workspace.js"]
    js_assets = ['../wsgi/static/' + i for i in js_assets]
    js = Bundle(*js_assets,
                filters='jsmin', output='gadget/packed.js')
    assets.register('js_all', js)

    css_assets = [
        "css/oo.ui.SemanticOperationsSelector.css",
        "css/oo.ui.SemanticsSelector.css",
        "css/wikiLabels.css",
        "css/form.css",
        "css/workspace.css",
        "css/home.css",
        "css/views.css"
    ]
    css_assets = ['../wsgi/static/' + i for i in css_assets]
    css = Bundle(*css_assets,
                 filters='cssmin', output='gadget/packed.css')
    assets.register('css_all', css)

    # Configure OOJS-UI routes
    oojsui_bp = flask_oojsui.build_static_blueprint(
        'wikilabels-oojsui', __name__,
        url_prefix=config['wsgi']['url_prefix'])
    app.register_blueprint(oojsui_bp)
    return app
