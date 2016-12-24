from flask import Response, render_template, request, send_from_directory

from ..util import (app_path, build_script_tags, build_style_tags, i18n_dict,
                    minify_js, pretty_json, read_cat, static_file_path,
                    url_for)
from .gadget import TOOLS_CDN, LOCAL_LIBS, JS, MEDIAWIKI_STYLES, CSS, LOCAL_STYLES

MEDIAWIKI_LIBS = (TOOLS_CDN + "jquery/2.1.3/jquery.js",
                  "lib/jquery-spinner/jquery.spinner.js",
                  "/oojs-static/oojs.jquery.js",
                  "/oojs-ui-static/oojs-ui.js",
                  "/oojs-ui-static/oojs-ui-mediawiki.js")


def configure(bp, config):
    @bp.route("/ui/")
    def ui():
        # TODO: List avalible wikis
        return "Welcome to the index page of the Wiki labels flask app. " + \
               "There are 5 top-level paths: auth, campaigns, users, " + \
               "forms and form_builder."

    @bp.route("/ui/<wiki>")
    def standalone_ui(wiki):
        script_tags = '<script src="{0}"></script>' \
                       .format(app_path('/gadget/' + wiki + '/mediawiki.js',
                                        config))
        script_tags += build_script_tags(MEDIAWIKI_LIBS + LOCAL_LIBS + JS,
                                        config)
        script_tags += '<script src="{0}"></script>' \
                       .format(app_path('/gadget/WikiLabels.messages.js',
                                        config))

        style_tags = build_style_tags(MEDIAWIKI_STYLES + LOCAL_STYLES + CSS,
                                      config)
        return render_template("gadget.html",
                               script_tags=script_tags,
                               style_tags=style_tags,
                               server_root=url_for("", config))

    return bp