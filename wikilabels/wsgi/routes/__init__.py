from . import auth
from . import campaigns
from . import form_builder
from . import forms
from . import gadget
from . import users

def configure(config, bp, db, oauth, form_map):

    @bp.route("/")
    def index():
        return "Welcome to the index page of the Wiki labels flask app.  " + \
               "There are 5 top-level paths: auth, campaigns, users, forms " + \
               "and form_builder."

    bp = auth.configure(bp, config, oauth)
    bp = campaigns.configure(bp, config, db)
    bp = users.configure(bp, config, db)
    bp = forms.configure(bp, config, form_map)
    bp = form_builder.configure(bp)
    bp = gadget.configure(bp, config)

    return bp
