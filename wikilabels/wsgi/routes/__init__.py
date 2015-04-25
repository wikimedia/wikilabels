from . import auth
from . import campaigns
from . import form_builder
from . import forms
from . import gadget
from . import users

def configure(config, bp, db, oauth, form_map):

    @bp.route("/")
    def index():
        return "Welcome to the index page of the revision coder flask app.  " +\
               "There are 4 top-level paths: auth, campaigns, users and forms."

    bp = auth.configure(bp, config, oauth)
    bp = campaigns.configure(bp, config, db)
    bp = users.configure(bp, config, db)
    bp = forms.configure(bp, config, form_map)
    bp = form_builder.configure(bp)
    bp = gadget.configure(bp)

    return bp
