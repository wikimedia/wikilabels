import os
from functools import lru_cache, wraps

import uglipyjs
from flask import current_app, request


def read_param(request, param, default=None, type=str):
    try:
        value = request.args.get(param, request.form.get(param, default))
        return type(value.strip())
    except (ValueError, TypeError) as e:
        error = errors.bad_request("Could not interpret {0}. {1}" \
                                   .format(param, str(e)))
        raise ParamError(error)

def read_bar_split_param(request, param, default=None, type=str):
    values = read_param(request, param, default=default)
    if values == None:
        return []
    return [type(value) for value in values.split("|")]

def jsonp(func):
    """Wraps JSONified output for JSONP requests."""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        callback = request.args.get('callback', None)
        if callback is not None:
            data = str(func(*args, **kwargs).data)
            content = str(callback) + '(' + data + ')'
            mimetype = 'application/javascript'
            return current_app.response_class(content, mimetype=mimetype)
        else:
            return func(*args, **kwargs)
    return decorated_function


def static_file_path(path):
    dir_name = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(dir_name, "static", path)

@lru_cache(128)
def read_javascript(static_paths, minify=False):
    if minify:
        return uglipyjs.compile(read_cat(static_paths))
    else:
        return read_cat(static_paths)

@lru_cache(128)
def read_cat(static_paths):
    return "".join(open(static_file_path(path)).read()
                   for path in static_paths)

def build_script_tags(static_paths):
    return "".join('<script src="/static/{0}"></script>'.format(path)
                   for path in static_paths)

def build_style_tags(static_paths):
    return "".join('<link rel="stylesheet" type="text/css" ' + \
                   'href="/static/{0}" />'.format(path)
                   for path in static_paths)


def url_for(relative_path, config):
    return "//{host}{application_root}{0}"\
           .format(relative_path, **config['wsgi'])
