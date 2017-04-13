from flask import Response, render_template, request

from .. import assets, preprocessors
from ..util import (build_maintenance_notice, build_script_tags,
                    build_style_tags, i18n_dict, minify_js, pretty_json,
                    read_cat, url_for)


def configure(bp, config):
    @bp.route("/gadget/")
    @preprocessors.debuggable
    def gadget():
        script_tags = build_script_tags(assets.LIB_JS, config)
        style_tags = build_style_tags(assets.LIB_CSS, config)
        return render_template(
            "gadget.html",
            script_tags=script_tags,
            style_tags=style_tags,
            url_root=request.url_root,
            mw_host="en.wikipedia.org",
            maintenance_notice=build_maintenance_notice(request, config))

    @bp.route("/gadget/WikiLabels.css")
    def gadget_style():
        return Response(read_cat(assets.CSS),
                        mimetype="text/css")

    @bp.route("/gadget/WikiLabels.js")
    def gadget_application():
        i18n_str = pretty_json(i18n_dict())
        response_text = read_cat(assets.JS) + \
            render_template("wikiLabels.messages.js", i18n=i18n_str)

        if 'minify' in request.args:
            response_text = minify_js(response_text)

        return Response(response_text, mimetype="application/javascript")

    @bp.route("/gadget/WikiLabels.messages.js")
    def gadget_messages():
        i18n_str = pretty_json(i18n_dict())
        js = render_template("wikiLabels.messages.js", i18n=i18n_str)
        if 'minify' in request.args:
            js = minify_js(js)
        return Response(js, mimetype="application/javascript")

    @bp.route("/gadget/loader.js")
    def gadget_loader():

        if 'prefix' in request.args:
            prefix = request.args['prefix']
            css_path = prefix + "WikiLabels.css"
            js_path = prefix + "WikiLabels.js"
        else:
            css_path = url_for("/gadget/WikiLabels.css")
            js_path = url_for("/gadget/WikiLabels.js")

        js = render_template("loader.js", css_path=css_path, js_path=js_path,
                             url_root=request.url_root)
        if 'minify' in request.args:
            js = minify_js(js)
        return Response(js, mimetype="application/javascript")

    return bp
