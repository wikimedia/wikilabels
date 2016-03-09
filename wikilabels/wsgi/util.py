import json
import os
from collections import OrderedDict
from functools import lru_cache, wraps
from itertools import chain

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

def build_script_tags(static_paths, config):
    return "".join('<script src="{0}"></script>'\
                   .format(static_path(path, config))
                   for path in static_paths)

def build_style_tags(static_paths, config):
    return "".join('<link rel="stylesheet" type="text/css" href="{0}" />'\
                   .format(static_path(path, config))
                   for path in static_paths)

def app_path(path, config):
    return path_join("/", config['wsgi']['application_root'], path)

def static_path(path, config):
    if path[:4] == "http" or path[:2] == "//":
        return path
    else:
        return app_path(path_join("static", path), config)

def url_for(path, config):
    return "//" + path_join(config['wsgi']['host'],
                            config['wsgi']['application_root'],
                            path)


def path_join(*path_parts):
    path_parts = [path for path in path_parts if len(path) > 0]
    if len(path_parts) == 0:
        return ""
    elif len(path_parts) == 1:
        return path_parts[0]
    else: # len(path_parts) >= 2
        return "/".join(chain([path_parts[0].rstrip("/")],
                              (path.strip("/") for path in path_parts[1:-1]),
                              [path_parts[-1].lstrip("/")]))


def get_i18n_dir():
    path = os.path.abspath(__file__)
    path = os.path.dirname(path)
    path = os.path.join(path, '../i18n/')
    return path


def i18n_dict():
    i18n_dir = get_i18n_dir()
    i18n = {}
    for lang_file in os.listdir(i18n_dir):
        f = open(os.path.join(i18n_dir, lang_file), 'r')
        lang_i18n = json.load(f)
        i18n[lang_file[:-5]] = OrderedDict(
            sorted(lang_i18n.items(), key=lambda t: t[0]))

    i18n = OrderedDict(sorted(i18n.items(), key=lambda t: t[0]))
    return i18n

def pretty_json(data):
    return json.dumps(data, ensure_ascii=False, sort_keys=True,
                      separators=(',', ': '), indent=8)
