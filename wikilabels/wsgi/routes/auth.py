from flask import redirect, request, session
from flask.ext.jsonpify import jsonify
from urllib.parse import quote

from .. import preprocessors, responses


def configure(bp, config, oauth):

    @bp.route("/auth/")
    def auth_index():
        info = "Welcome to the auth module.  You can /auth/initiate an " + \
               "oauth handshake.  You can ask /auth/whoami?  If you are " + \
               "already logged in, you can /auth/logout."

        return jsonify({'info': info,
                        'paths': ['initiate', 'whoami', 'logout']})

    @bp.route("/auth/initiate/")
    def auth_initiate():
        """
        Performs an OAuth handshake.
        """
        # Doesn't work yet
        # oauth_callback = config['wsgi']['application_root'] + \
        #     "/auth/callback/"
        wiki = None
        if 'wiki' in request.args:
            wiki = request.args['wiki']
            wiki.strip()
        auth_url, rt = oauth.initiate()
        session['request_token'] = rt
        session['callback_wiki'] = wiki

        # return HTML to redirect user to mediawiki-login
        return redirect(auth_url)

    @bp.route("/auth/whoami/")
    def whoami():
        """Returns user information if authenticated"""
        if 'user' in session:
            return jsonify({'user': session['user']})
        else:
            return responses.forbidden()

    @bp.route("/auth/callback/")
    def auth_callback():
        """
        Completes the oauth handshake
        """
        if 'request_token' not in session:
            return responses.forbidden("OAuth callback failed.  " +
                                       "Are cookies disabled?")
        else:
            access_token = oauth.complete(session['request_token'],
                                          str(request.query_string, 'ascii'))

        # Get user info
        identity = oauth.identify(access_token)

        # Store user info in session
        session['user'] = {'id': identity['sub']}

        if 'callback_wiki' not in session or not session['callback_wiki']:
            url = request.url_root + 'ui/'
        else:
            url = request.url_root + 'ui/' + quote(session['callback_wiki']) \
                + '/'

        content = '<meta http-equiv="refresh" content="0; url=' + url + '" />'
        # Return to ui page
        return content

    @bp.route("/auth/logout/")
    @preprocessors.authenticated
    def logout():
        """
        Deletes the local session.
        """
        if 'user' in session:
            del session['user']

        return jsonify({'success': True})

    return bp
