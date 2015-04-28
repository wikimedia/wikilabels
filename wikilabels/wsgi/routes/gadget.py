from flask import Response, render_template, request, send_from_directory

from ..util import (build_script_tags, build_style_tags, read_cat,
                    read_javascript)

MEDIAWIKI_LIBS = ("lib/mediaWiki/mediaWiki.js",
                  "lib/jquery/jquery.js",
                  "lib/oojs/oojs.jquery.js",
                  "lib/oojs-ui/oojs-ui.js",
                  "lib/oojs-ui/oojs-ui-mediawiki.js")
LOCAL_LIBS = ("lib/date-format/date-format.js",
              "lib/strftime/strftime.js")
JS = ("js/oo.util.js",
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
      "js/wikiLabels/Workspace.js")

MEDIAWIKI_STYLES = ("lib/mediaWiki/enwiki.vector.css",
                    "lib/oojs-ui/oojs-ui-mediawiki.css")
LOCAL_STYLES = tuple()
CSS = ("css/wikiLabels.css",
       "css/home.css")

def configure(bp):

    @bp.route("/gadget/")
    def gadget():
        script_tags = build_script_tags(MEDIAWIKI_LIBS + LOCAL_LIBS + JS)
        style_tags = build_style_tags(MEDIAWIKI_STYLES + LOCAL_STYLES + CSS)
        return render_template("gadget.html",
                               script_tags=script_tags,
                               style_tags=style_tags)

    @bp.route("/gadget/WikiLabels.css")
    def gadget_style():
        return Response(read_cat(LOCAL_STYLES + CSS),
                        mimetype="text/css")

    @bp.route("/gadget/WikiLabels.js")
    def gadget_application():

        minify = 'minify' in request.args

        print(LOCAL_LIBS + JS)
        return Response(read_javascript(LOCAL_LIBS + JS, minify),
                        mimetype="application/javascript")



    @bp.route("/gadget/themes/<path:path>")
    def gadget_themes(path):
        return send_from_directory(static_file_path("lib/oojs-ui/themes"),
                                   path)

    return bp
