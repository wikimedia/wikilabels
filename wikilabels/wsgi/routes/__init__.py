from flask import render_template, send_from_directory, request

import os

from . import auth
from . import campaigns
from . import form_builder
from . import forms
from . import gadget
from . import versions
from . import users
from . import ui
from .. import util


def configure(config, bp, db, oauth, form_map):

    @bp.route("/")
    def index():
        return render_template(
            "home.html",
            maintenance_notice=util.build_maintenance_notice(request, config))

    # Add icon
    @bp.route('/favicon.ico')
    def favicon():
        return send_from_directory(
            os.path.join(bp.root_path, 'static'),
            'favicon.ico', mimetype='image/vnd.microsoft.icon')

    bp = auth.configure(bp, config, oauth)
    bp = campaigns.configure(bp, config, db)
    bp = users.configure(bp, config, db)
    bp = forms.configure(bp, config, form_map)
    bp = form_builder.configure(bp, config)
    bp = gadget.configure(bp, config)
    bp = versions.configure(bp, config)
    bp = ui.configure(bp, config, db)

    return bp
