import importlib
from collections import OrderedDict

from flask import render_template, request

from ..util import build_maintenance_notice


def configure(bp, config):

    @bp.route("/versions/")
    def versions():
        modules = ['wikilabels']
        versions = OrderedDict()
        for module in modules:
            try:
                versions[module] = importlib.import_module(module).__version__
            except ImportError:
                pass

        return render_template(
            "versions.html", versions=versions,
            maintenance_notice=build_maintenance_notice(request, config))

    return bp
