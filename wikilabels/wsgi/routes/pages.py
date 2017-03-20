from collections import OrderedDict
from flask import render_template
import importlib

def configure(bp, config):

    @bp.route("/version/")
    def version():
        modules = ['wikilabels']
        versions = OrderedDict()
        for module in modules:
            try:
                versions[module] = importlib.import_module( module ).__version__
            except ImportError:
                pass

        return render_template("version.html",
                               versions=versions)

    return bp
