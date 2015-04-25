from flask import Response, render_template, request, send_from_directory

from ..util import (build_script_tags, build_style_tags, read_cat,
                    read_javascript)

MEDIAWIKI_LIBS = ("lib/jquery/jquery.js",
                  "lib/oojs/oojs.jquery.js",
                  "lib/oojs-ui/oojs-ui.js",
                  "lib/oojs-ui/oojs-ui-mediawiki.js")
LOCAL_LIBS = ("lib/date-format/date-format.js", )
JS = ("js/oo.util.js",
      "js/wikiLabels/wikiLabels.js",
      "js/wikiLabels/util.js",
      "js/wikiLabels/Form.js",
      "js/wikiLabels/Home.js",
      "js/wikiLabels/i18n.js",
      "js/wikiLabels/server.js",
      "js/wikiLabels/User.js",
      "js/wikiLabels/util.js",
      "js/wikiLabels/Workspace.js")

MEDIAWIKI_STYLES = tuple() # TODO: Will need to include MediaWiki CSS
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

application_cache = None
style_cache = None

def concat_style():
    global style_cache
    style_cache = None
    if style_cache is None:
        style_cache = "".join([
            open(static_file_path("lib/oojs-ui/oojs-ui-mediawiki.css")).read(),
            open(static_file_path("lib/codemirror/codemirror.css")).read(),
            open(static_file_path("css/form_builder.css")).read(),
            open(static_file_path("css/wikilabels.css")).read()
        ])

    return style_cache

def concat_application():
    global application_cache
    application_cache = None
    if application_cache is None:
        application_cache = "".join([
            open(static_file_path("js/wikilabels.form.js")).read(),
            open(static_file_path("js/wikilabels.home.js")).read(),
            open(static_file_path("js/wikilabels.i18n.js")).read(),
            open(static_file_path("js/wikilabels.server.js")).read(),
            open(static_file_path("js/wikilabels.user.js")).read(),
            open(static_file_path("js/wikilabels.util.js")).read(),
            open(static_file_path("js/wikilabels.workspace.js")).read(),
        ])

    return application_cache
