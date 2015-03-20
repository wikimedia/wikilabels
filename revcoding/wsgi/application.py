import json
from flask import Flask, request
import mwoauth

def configure(config=None):
    config = config or {}

    app = Flask("revcoding")

    @app.route("/")
    def index():
        return "Welcome to the index page of the revision coder flask app."

    @app.route("/authorize/")
    def authorize():
        """
        Performs an OAuth handshake.  Needs access to mediawiki configuration
        """
        return "Authorize not implemented yet."

    @app.route("/oauth_callback/")
    def oauth_callback():
        """
        Completes the oauth handshake
        """
        return "OAuth callback not implemented yet."

    @app.route("/logout/")
    def logout():
        """
        Deletes the local session.
        """
        return "Logout not implemented yet."

    @app.route("/<wiki>/", methods=["GET"])
    def get_wiki(wiki):
        """
        Returns a list of campaigns available for this particular wiki.
        """
        if 'create' in request.args:
            create_campaign(wiki, request.args['create'])
        else:
            return "Get wiki not implemented yet."

    @app.route("/<wiki>/", methods=["POST"])
    def create_campaign(wiki, campaign):
        """
        Creates a new campaign
        """
        return "Create campaign not implemented yet."

    @app.route("/<wiki>/<int:campaign>/", methods=["GET"])
    def get_campaign(wiki, campaign):
        """
        Returns metadata for a campaign or assign a new workset
        """
        if 'assign' in request.args:
            return assign_workset(wiki, campaign)
        else:
            return "Get campaign not implemented yet."

    @app.route("/<wiki>/<int:campaign>/", methods=["POST"])
    def assign_workset(wiki, campaign):
        """
        Assigns and gathers metadata for a particular workset
        """
        return "Assign workset not implemented yet."

    @app.route("/<wiki>/<int:campaign>/<int:workset>/", methods=["GET"])
    def get_workset(wiki, campaign, workset):
        """
        Gathers metadata for a particular workset
        """
        return "Get workset not implemented yet."

    @app.route("/<wiki>/<int:campaign>/<int:workset>/<int:task>/", methods=["GET"])
    def get_task(wiki, campaign, workset, task):
        """
        Gets a task label
        """
        if 'label' in request.args:
            return label_task(wiki, campaign, workset, task, request.args['label'])
        else:
            return "Get task not implemented yet."

    @app.route("/<wiki>/<int:campaign>/<int:workset>/<int:task>/",
               methods=["PUT", "POST"])
    def label_task(wiki, campaign, workset, task, label=None):
        """
        Adds a label to a workset task.
        """
        label = json.loads(request.form.get('label', label))

        return "Label task not implemented yet ({0})".format(label)

    return app
