from flask import render_template

from .. import assets, preprocessors, responses
from ..util import app_path, build_script_tags, build_style_tags, url_for


def configure(bp, config):

    @bp.route("/ui/")
    def ui():
        return render_template("ui.html",
                               wikis=sorted(list(config['wikis'].keys())))

    @bp.route("/ui/<wiki>/")
    @preprocessors.debuggable
    def ui_wiki(wiki):
        if wiki not in config['wikis']:
            return responses.not_found('Wiki config not found')
        script_tags = '<script src="{0}"></script>' \
            .format(app_path('/gadget/' + wiki + '/mediawiki.js',
                    config))
        script_tags += build_script_tags(assets.LIB_JS, config)
        style_tags = build_style_tags(assets.LIB_CSS, config)

        return render_template("ui_wiki.html",
                               script_tags=script_tags,
                               style_tags=style_tags,
                               server_root=url_for("", config),
                               **config['wikis'][wiki])

    return bp
