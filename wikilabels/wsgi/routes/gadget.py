from flask import (Response, render_template, render_template_string, request,
                   send_from_directory)

from ..util import (app_path, build_script_tags, build_style_tags, i18n_dict,
                    minify_js, pretty_json, read_cat, static_file_path,
                    url_for)

TOOLS_CDN = "//tools-static.wmflabs.org/cdnjs/ajax/libs/"

MEDIAWIKI_LIBS = ("lib/mediaWiki/mediaWiki.js",
                  TOOLS_CDN + "jquery/2.1.3/jquery.js",
                  "lib/jquery-spinner/jquery.spinner.js",
                  "lib/oojs/oojs.jquery.js",
                  "lib/oojs-ui/oojs-ui.js",
                  "lib/oojs-ui/oojs-ui-mediawiki.js")
LOCAL_LIBS = ("lib/date-format/date-format.js",
              "lib/strftime/strftime.js")
JS = ("js/oo.util.js",
      "js/oo.ui.SemanticOperationsSelector.js",
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
                    "lib/mediaWiki/enwiki.common.css",
                    "lib/mediaWiki/diffs.css",
                    "lib/oojs-ui/oojs-ui-mediawiki.css")
LOCAL_STYLES = tuple()
CSS = ("css/oo.ui.SemanticOperationsSelector.css",
       "css/wikiLabels.css",
       "css/form.css",
       "css/workspace.css",
       "css/home.css",
       "css/views.css")


def configure(bp, config):
    @bp.route("/gadget/")
    def gadget():
        script_tags = build_script_tags(MEDIAWIKI_LIBS + LOCAL_LIBS + JS,
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

    @bp.route("/gadget/WikiLabels.css")
    def gadget_style():
        return Response(read_cat(LOCAL_STYLES + CSS),
                        mimetype="text/css")

    @bp.route("/gadget/WikiLabels.js")
    def gadget_application():
        i18n_str = pretty_json(i18n_dict())
        response_text = read_cat(LOCAL_LIBS + JS) + \
            render_template("wikiLabels.messages.js", i18n=i18n_str)

        if 'minify' in request.args:
            response_text = minify_js(response_text)

        return Response(response_text, mimetype="application/javascript")

    @bp.route("/gadget/WikiLabels.messages.js")
    def gadget_messages():
        i18n_str = pretty_json(i18n_dict())
        js = render_template("wikiLabels.messages.js", i18n=i18n_str)
        return Response(js, mimetype="application/javascript")

    @bp.route("/gadget/loader.js")
    def gadget_loader():

        if 'prefix' in request.args:
            prefix = request.args['prefix']
            css_path = prefix + "WikiLabels.css"
            js_path = prefix + "WikiLabels.js"
        else:
            css_path = url_for("/gadget/WikiLabels.css", config)
            js_path = url_for("/gadget/WikiLabels.js", config)

        js = render_template("loader.js", css_path=css_path, js_path=js_path,
                             server_root=url_for("", config))
        return Response(js, mimetype="application/javascript")

    @bp.route("/gadget/themes/<path:path>")
    def gadget_themes(path):
        return send_from_directory(static_file_path("lib/oojs-ui/themes"),
                                   path)

    return bp
