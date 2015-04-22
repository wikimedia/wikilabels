from flask import Response, render_template, send_from_directory

from ..util import static_file_path


def configure(bp):

    @bp.route("/form_builder/")
    def form_builder():
        return render_template("form_builder.html")

    @bp.route("/form_builder/style.css")
    def style():
        return Response(concat_css(), mimetype="text/css")

    @bp.route("/form_builder/application.js")
    def application():
        return Response(concat_js(), mimetype="application/javascript")

    @bp.route("/form_builder/themes/<path:path>")
    def themes(path):
        return send_from_directory(static_file_path("lib/oojs-ui/themes"),
                                   path)

    return bp

js_cache = None
css_cache = None

def concat_css():
    global css_cache
    css_cache = None
    if css_cache is None:
        css_cache = "".join([
            open(static_file_path("lib/oojs-ui/oojs-ui-mediawiki.css")).read(),
            open(static_file_path("lib/codemirror/codemirror.css")).read(),
            open(static_file_path("css/form_builder.css")).read(),
            open(static_file_path("css/wikilabels.css")).read()
        ])

    return css_cache

def concat_js():
    global js_cache
    js_cache = None
    if js_cache is None:
        js_cache = "".join([
            open(static_file_path("lib/jquery/jquery.js")).read(),
            open(static_file_path("lib/oojs/oojs.jquery.js")).read(),
            open(static_file_path("lib/oojs-ui/oojs-ui.js")).read(),
            open(static_file_path("lib/oojs-ui/oojs-ui-mediawiki.js")).read(),
            open(static_file_path("lib/yaml/yaml.js")).read(),
            open(static_file_path("lib/codemirror/codemirror.js")).read(),
            open(static_file_path("lib/codemirror-modes/yaml/yaml.js")).read(),
            open(static_file_path("js/oo.util.js")).read(),
            open(static_file_path("js/wikilabels.js")).read(),
            open(static_file_path("js/wikilabels.util.js")).read(),
            open(static_file_path("js/wikilabels.form.js")).read(),
            open(static_file_path("js/wikilabels.form_builder.js")).read()
        ])

    return js_cache
