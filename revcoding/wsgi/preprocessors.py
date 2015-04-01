from functools import wraps

from flask import session

from . import responses


def authenticated(f):
    @wraps(f)
    def wrapped_f(*args, **kwargs):
        if 'user' in session:
            return f(*args, **kwargs)
        else:
            return responses.forbidden()

    return wrapped_f
