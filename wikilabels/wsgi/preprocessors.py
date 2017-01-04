from functools import wraps

from flask import current_app, request, session

from . import responses


def authenticated(f):
    @wraps(f)
    def wrapped_f(*args, **kwargs):
        if 'user' in session:
            return f(*args, **kwargs)
        else:
            return responses.forbidden()

    return wrapped_f


def debuggable(f):
    @wraps(f)
    def wrapped_f(*args, **kwargs):
        debug = request.args.get('debug', None) is not None
        current_app.config['ASSETS_DEBUG'] = debug

        return f(*args, **kwargs)

    return wrapped_f
