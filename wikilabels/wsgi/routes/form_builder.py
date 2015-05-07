import uglipyjs
from flask import Response, render_template, request, send_from_directory

from ..util import (build_script_tags, build_style_tags, read_cat,
                    read_javascript)

MEDIAWIKI_LIBS = ("lib/mediaWiki/mediaWiki.js",
                  "lib/jquery/jquery.js",
                  "lib/oojs/oojs.jquery.js",
                  "lib/oojs-ui/oojs-ui.js",
                  "lib/oojs-ui/oojs-ui-mediawiki.js")
LOCAL_LIBS = ("lib/yamljs/yaml.js",
              "lib/codemirror/codemirror.js",
              "lib/codemirror-modes/yaml/yaml.js")
JS = ("js/oo.util.js",
      "js/wikiLabels/wikiLabels.js",
      "js/wikiLabels/i18n.js",
      "js/wikiLabels/util.js",
      "js/wikiLabels/Form.js",
      "js/wikiLabels/FormBuilder.js")

MEDIAWIKI_STYLES = ("lib/oojs-ui/oojs-ui-mediawiki.css",)
LOCAL_STYLES = ("lib/codemirror/codemirror.css",)
CSS = ("css/wikiLabels.css",
       "css/form_builder.css",
       "css/form.css",
       "css/workspace.css")

def configure(bp, config):


    @bp.route("/form_builder/")
    def form_builder():
        script_tags = build_script_tags(MEDIAWIKI_LIBS + LOCAL_LIBS + JS,
                                        config)
        style_tags = build_style_tags(MEDIAWIKI_STYLES + LOCAL_STYLES + CSS,
                                      config)
        return render_template("form_builder.html",
                               script_tags=script_tags,
                               style_tags=style_tags)


    @bp.route("/form_builder/FormBuiler.css")
    def form_builder_style():
        return Response(read_cat(LOCAL_STYLES + CSS),
                        mimetype="text/css")

    @bp.route("/form_builder/FormBuilder.js")
    def form_builder_application():

        minify = 'minify' in request.args

        return Response(read_javascript(LOCAL_LIBS + JS, minify),
                        mimetype="application/javascript")

    @bp.route("/form_builder/themes/<path:path>")
    def form_builder_themes(path):
        return send_from_directory(static_file_path("lib/oojs-ui/themes"),
                                   path)

    return bp
