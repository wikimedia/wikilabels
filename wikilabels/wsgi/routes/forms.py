from flask.ext.jsonpify import jsonify

from .. import responses


def configure(bp, config, form_map):

    @bp.route("/forms/", methods=["GET"])
    def forms_index():
        """
        Returns a list of available forms.
        """
        info = "Welcome to the forms module.  This module provides " + \
               "access to form configuration.  The only meaningful path " + \
               "is /forms/<form_name>/"

        form_names = list(form_map.keys())
        form_names.sort()
        return jsonify({'info': info,
                        'forms': form_names})

    @bp.route("/forms/<form_name>/", methods=['GET'])
    def get_form(form_name):
        if form_name in form_map:
            return jsonify({'form': form_map[form_name]})
        else:
            return responses.not_found("form_name={0}".format(form_name))

    return bp
