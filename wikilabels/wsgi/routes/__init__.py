from flask import render_template

from . import auth
from . import campaigns
from . import form_builder
from . import forms
from . import gadget
from . import users
from . import ui


def configure(config, bp, db, oauth, form_map):

    @bp.route("/")
    def index():
        return render_template("home.html")

    bp = auth.configure(bp, config, oauth)
    bp = campaigns.configure(bp, config, db)
    bp = users.configure(bp, config, db)
    bp = forms.configure(bp, config, form_map)
    bp = form_builder.configure(bp, config)
    bp = gadget.configure(bp, config)
    bp = ui.configure(bp, config)

    return bp
