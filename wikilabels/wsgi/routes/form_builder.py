from flask import render_template, send_from_directory

from ..util import (app_path, build_script_tags, build_style_tags,
                    static_file_path)

TOOLS_CDN = "//tools-static.wmflabs.org/cdnjs/ajax/libs/"

MEDIAWIKI_LIBS = ("lib/mediaWiki/mediaWiki.js",
                  TOOLS_CDN + "jquery/2.1.3/jquery.js",
                  "lib/jquery-spinner/jquery.spinner.js",
                  "lib/oojs/oojs.jquery.js",
                  "lib/oojs-ui/oojs-ui.js",
                  "lib/oojs-ui/oojs-ui-mediawiki.js")
LOCAL_LIBS = (TOOLS_CDN + "js-yaml/3.3.0/js-yaml.js",
              TOOLS_CDN + "codemirror/5.2.0/codemirror.js",
              TOOLS_CDN + "codemirror/5.2.0/mode/yaml/yaml.js")
JS = ("js/oo.util.js",
      "js/oo.ui.SemanticOperationsSelector.js",
      "js/oo.ui.SemanticsSelector.js",
      "js/wikiLabels/wikiLabels.js",
      "js/wikiLabels/i18n.js",
      "js/wikiLabels/util.js",
      "js/wikiLabels/Form.js",
      "js/wikiLabels/FormBuilder.js")

MEDIAWIKI_STYLES = ("lib/oojs-ui/oojs-ui-mediawiki.css",)
LOCAL_STYLES = (TOOLS_CDN + "codemirror/5.2.0/codemirror.css",)
CSS = ("css/oo.ui.SemanticOperationsSelector.css",
       "css/oo.ui.SemanticsSelector.css",
       "css/wikiLabels.css",
       "css/form_builder.css",
       "css/form.css",
       "css/workspace.css")


def configure(bp, config):

    @bp.route("/form_builder/")
    def form_builder():
        script_tags = build_script_tags(MEDIAWIKI_LIBS + LOCAL_LIBS + JS,
                                        config)

        script_tags += '<script src="{0}"></script>' \
                       .format(app_path('/gadget/WikiLabels.messages.js',
                                        config))

        style_tags = build_style_tags(MEDIAWIKI_STYLES + LOCAL_STYLES + CSS,
                                      config)
        return render_template("form_builder.html",
                               script_tags=script_tags,
                               style_tags=style_tags)

    @bp.route("/form_builder/themes/<path:path>")
    def form_builder_themes(path):
        return send_from_directory(static_file_path("lib/oojs-ui/themes"),
                                   path)

    return bp
