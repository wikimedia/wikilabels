from flask import redirect, request, session
from flask.ext.jsonpify import jsonify

from .. import preprocessors, responses
from ...database import NotFoundError


def configure(bp, config, db):

    @bp.route("/users/", methods=["GET"])
    def get_users():
        """
        Returns a list of user_ids that have ever been assigned a workset.
        """
        info = "Welcome to the users module.  This module provides access " + \
               "to data via the lens of a user."
        return jsonify({'info': info, 'users': db.worksets.users()})


    @bp.route("/users/<int:user_id>/")
    def get_user(user_id):
        """
        Gets information about a user
        """

        doc = {'user': {'id': user_id}}
        if 'campaigns' in request.args:
            stats = request.args.get('campaigns') == "stats"
            doc['campaigns'] = db.campaigns.for_user(user_id, stats=stats)

        if 'worksets' in request.args:
            stats = request.args.get('worksets') == "stats"
            doc['worksets'] = db.worksets.for_user(user_id, stats=stats)

        if 'tasks' in request.args:
            doc['tasks'] = db.tasks.for_user(user_id)

        return jsonify(doc)


    @bp.route("/users/<int:user_id>/<int:campaign_id>/")
    def get_user_campaign(user_id, campaign_id):
        """
        Gets information about a user
        """

        doc = {'user': {'id': user_id}}
        try:
            stats = request.args.get('campaign') == "stats"
            doc['campaign'] = db.campaigns.get(campaign_id, stats=stats)
        except NotFoundError as e:
            return responses.not_found(str(e))

        if 'worksets' in request.args:
            stats = request.args.get('worksets') == "stats"
            doc['worksets'] = db.worksets.for_user(user_id,
                                                   campaign_id=campaign_id,
                                                   stats=stats)

        if 'tasks' in request.args:
            doc['tasks'] = db.tasks.for_user(user_id,
                                             campaign_id=campaign_id)

        return jsonify(doc)

    return bp
