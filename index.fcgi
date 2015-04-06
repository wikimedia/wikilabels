#!/usr/bin/env python3
from revcoding.wsgi import application
from flask import request
import yamlconf

config_path = "/data/project/revcoding/config/revcoder-test.yaml"
config = yamlconf.load(open(config_path))
app = application.configure(config)
app.debug = True

@app.errorhandler(404)
def page_not_found(error):
    return '<h1>404 - Not found</h1><p><small>' + request.path + '</small></p><p><small>' + repr(app.url_map) + '</small></p>', 404


if __name__ == '__main__':
    from flup.server.fcgi import WSGIServer
    WSGIServer(app, debug=True).run()
