from flask import request
from flask_jsonpify import jsonify


def error(status, code, message):
    error_doc = {'error': {'code': code, 'message': message}}
    if request.args.get('callback'):
        error_doc['http_status'] = status
        status = 200

    return jsonify(error_doc), status


def not_implemented(message=None):
    return error(501, 'not implemented',
                 message or "Route not implemented yet.")


def bad_request(message):
    return error(400, 'bad request', message)


def conflict(message):
    return error(409, 'conflict', message)


def forbidden(message=None):
    return error(403, 'forbidden',
                 message or "This request requires authentication.")


def not_found(message=None):
    return error(404, 'not found',
                 message or "Nothing found at this location.")
