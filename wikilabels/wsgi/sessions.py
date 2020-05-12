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


def configure(app, config):

    app.wsgi_app = SessionMiddleware(app.wsgi_app,
                                     {'session.type': config['session']['type'],
                                      'session.url': config['session']['url'],
                                      'session.data_dir': config['session']['data_dir']})
    app.session_interface = BeakerSessionInterface()

    return app
