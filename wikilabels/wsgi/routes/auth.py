from flask import redirect, request, session
from flask.ext.jsonpify import jsonify

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
        oauth_callback = config['application_root'] + "/auth/callback/"
        auth_url, rt = oauth.initiate(callback=oauth_callback)
        session['request_token'] = rt

        # return HTML to redirect user to mediawiki-login
        return redirect(auth_url)

    @bp.route("/auth/whoami/")
    def whoami():
        """Returns logged in status"""
        return jsonify({"user_id": session.get('user')})

    @bp.route("/auth/callback/")
    def auth_callback():
        """
        Completes the oauth handshake
        """
        if 'request_token' not in session:
            return responses.forbidden("OAuth callback")
        else:
            access_token = oauth.complete(session['request_token'],
                                          str(request.query_string, 'ascii'))

        # Get user info
        identity = oauth.identify(access_token)
        user_id = identity['sub']

        # Store snuggler
        session['user'] = user_id

        # Return window closing script.
        return """
        <html>
            <head>
                <script>window.close()</script>
            </head>
        </html>
        """

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
