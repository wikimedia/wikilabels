import os
from functools import wraps

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
