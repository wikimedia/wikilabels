from beaker.middleware import SessionMiddleware
from flask.sessions import SessionInterface


class BeakerSessionInterface(SessionInterface):
    def open_session(self, app, request):
        if 'beaker.session' in request.environ:
            return request.environ['beaker.session']
        else:
            return {}

    def save_session(self, app, session, response):
        session.save()


def configure(app):

    app.wsgi_app = SessionMiddleware(app.wsgi_app,
                                     {'session.type': 'ext:memcached',
                                      'session.url': 'memcached:11211',
                                      'session.data_dir': './cache'})
    app.session_interface = BeakerSessionInterface()

    return app
