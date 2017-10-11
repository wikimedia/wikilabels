from flask import render_template, request, send_from_directory

from .. import assets, preprocessors
from ...util import wikimedia
from ..util import build_script_tags, build_style_tags, static_file_path

LOCAL_LIBS = (assets.TOOLS_CDN + "js-yaml/3.3.0/js-yaml.js",
              assets.TOOLS_CDN + "codemirror/5.2.0/codemirror.js",
              assets.TOOLS_CDN + "codemirror/5.2.0/mode/yaml/yaml.js")

LOCAL_CSS = (assets.TOOLS_CDN + "codemirror/5.2.0/codemirror.css",)


def configure(bp, config):

    @bp.route("/form_builder/")
    @preprocessors.debuggable
    def form_builder():
        wiki = "enwiki"
        return form_builder_wiki(wiki)

    @bp.route("/form_builder/<wiki>/")
    @preprocessors.debuggable
    def form_builder_wiki(wiki):
        script_tags = build_script_tags(assets.LIB_JS + LOCAL_LIBS, config)
        style_tags = build_style_tags(assets.LIB_CSS + LOCAL_CSS, config)
        return render_template("form_builder.html",
                               script_tags=script_tags,
                               style_tags=style_tags,
                               url_root=request.url_root,
                               mw_host=wikimedia.host_from_dbname(wiki))

    @bp.route("/form_builder/themes/<path:path>")
    def form_builder_themes(path):
        return send_from_directory(static_file_path("lib/oojs-ui/themes"),
                                   path)

    return bp
