import json

import mwoauth
from flask import Flask, request
from flask.ext.jsonpify import jsonify


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
            return jsonify(
                {
                    "wiki": wiki,
                    "campaigns": [345, 376]
                }
            )

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
            return jsonify(
                {
                    "wiki": wiki,
                    "campaign": {
                        "id": campaign,
                        "name": "Edit quality -- 2014 10k sample",
                        "form": "damaging_and_goodfaith",
                        "view": "diff_to_previous",
                        "created": 1234567830,
                        "labels_per_task": 1,
                        "tasks": {
                            "labels": 10000,
                            "completed": 5723,
                            "assigned": 300
                        }
                    }
                }
            )

    @app.route("/<wiki>/<int:campaign>/", methods=["POST"])
    def assign_workset(wiki, campaign):
        """
        Assigns and gathers metadata for a particular workset
        """
        return get_workset(wiki, campaign, 9001)

    @app.route("/<wiki>/<int:campaign>/<int:workset>/", methods=["GET"])
    def get_workset(wiki, campaign, workset):
        """
        Gathers metadata for a particular workset
        """
        if 'abandon' in request.args:
            return jsonify({"success": True})

        if 'expand' in request.args:
            campaign = {
                "id": campaign,
                "name": "Edit quality -- 2014 10k sample",
                "form": "damaging_and_goodfaith",
                "view": "diff_to_previous",
                "created": 1234567830,
                "labels_per_task": 1,
                "tasks": {
                    "labels": 10000,
                    "completed": 5723,
                    "assigned": 300
                }
            }

        else:
            campaign = {"id": campaign}

        return jsonify(
            {
                "wiki": wiki,
                "campaign": campaign,
                "workset": {
                    "id": 1027,
                    "user_id": 607828,
                    "assigned": "2015-02-21T13:45:56Z",
                    "expiration": "2015-02-22T13:45:56Z",
                    "tasks": [
                        {"id": 102, "data": {"rev_id": 3456780}},
                        {"id": 103, "data": {"rev_id": 3456781}},
                        {"id": 104, "data": {"rev_id": 3456782}},
                        {"id": 105, "data": {"rev_id": 3456783}},
                        {"id": 106, "data": {"rev_id": 3456784}},
                        {"id": 107, "data": {"rev_id": 3456785}}
                    ]
                }
            }
        )

    @app.route("/<wiki>/<int:campaign>/<int:workset>/<int:task>/", methods=["GET"])
    def get_task(wiki, campaign, workset, task):
        """
        Gets a task label
        """
        if 'label' in request.args:
            return label_task(wiki, campaign, workset, task, request.args['label'])

        else:
            if 'expand' in request.args:
                campaign = {
                    "id": campaign,
                    "name": "Edit quality -- 2014 10k sample",
                    "form": "damaging_and_goodfaith",
                    "view": "diff_to_previous",
                    "created": 1234567830,
                    "labels_per_task": 1,
                    "tasks": {
                        "labels": 10000,
                        "completed": 5723,
                        "assigned": 300
                    }
                }

            else:
                campaign = {"id": campaign}

            return jsonify(
                {
                    "wiki": wiki,
                    "campaign": campaign,
                    "task": {
                        "id": task,
                        "data": {"rev_id": 3456780}
                    },
                    "labels": [
                        {
                            "user_id": 607828,
                            "timestamp": 1244597890,
                            "data": {
                                "damaging": False,
                                "good-faith": True
                            }
                        }
                    ]
                }
            )

    @app.route("/<wiki>/<int:campaign>/<int:workset>/<int:task>/",
               methods=["PUT", "POST"])
    def label_task(wiki, campaign, workset, task, label=None):
        """
        Adds a label to a workset task.
        """
        label = json.loads(request.form.get('label', label))

        if 'expand' in request.args:
            campaign = {
                "id": campaign,
                "name": "Edit quality -- 2014 10k sample",
                "form": "damaging_and_goodfaith",
                "view": "diff_to_previous",
                "created": 1234567830,
                "labels_per_task": 1,
                "tasks": {
                    "labels": 10000,
                    "completed": 5723,
                    "assigned": 300
                }
            }
            task = {
                "id": task,
                "data": {"rev_id": 3456780}
            }

        else:
            campaign = {"id": campaign}
            task = {"id": task}

        return jsonify({
            "wiki": wiki,
            "campaign": campaign,
            "task": task,
            "label": {
                "user_id": 607828,
                "timestamp": 1244597890,
                "data": {
                    "damaging": False,
                    "good-faith": True
                }
            }
        })

    return app
