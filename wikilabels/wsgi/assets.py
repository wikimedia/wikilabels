from cssmin import cssmin  # noqa
from flask_assets import Bundle, Environment
from jsmin import jsmin  # noqa

JS = ("lib/date-format/date-format.js",
      "lib/strftime/strftime.js",
      "lib/jquery-spinner/jquery.spinner.js",
      "js/oo.util.js",
      "js/oo.ui.SemanticOperationsSelector.js",
      "js/oo.ui.SemanticsSelector.js",
      "js/wikiLabels/wikiLabels.js",
      "js/wikiLabels/util.js",
      "js/wikiLabels/api.js",
      "js/wikiLabels/config.js",
      "js/wikiLabels/Form.js",
      "js/wikiLabels/Labeler.js",
      "js/wikiLabels/Home.js",
      "js/wikiLabels/i18n.js",
      "js/wikiLabels/server.js",
      "js/wikiLabels/User.js",
      "js/wikiLabels/views.js",
      "js/wikiLabels/mediawiki.js",
      "js/wikiLabels/Workspace.js")

CSS = ("css/oo.ui.SemanticOperationsSelector.css",
       "css/oo.ui.SemanticsSelector.css",
       "css/wikiLabels.css",
       "css/form.css",
       "css/workspace.css",
       "css/home.css",
       "css/labeler.css",
       "css/views.css")

TOOLS_CDN = "//tools-static.wmflabs.org/cdnjs/ajax/libs/"
LIB_JS = (TOOLS_CDN + "jquery/2.1.3/jquery.js",
          "/oojs-static/oojs.jquery.js",
          "/oojs-ui-static/oojs-ui.min.js",
          "/oojs-ui-static/oojs-ui-mediawiki.min.js")

LIB_CSS = (TOOLS_CDN + "codemirror/5.2.0/codemirror.css",
           "/oojs-ui-static/oojs-ui-mediawiki.min.css",
           "lib/mediaWiki/diffs.css")


def configure(app):
    environment = Environment(app)

    js = Bundle(*JS,
                filters='jsmin', output='gadget/packed.js')
    environment.register('js_all', js)

    css = Bundle(*CSS,
                 filters='cssmin', output='gadget/packed.css')
    environment.register('css_all', css)

    return app
