from flask import render_template, request

from .. import assets, responses
from ..util import (build_maintenance_notice, build_script_tags,
                    build_style_tags, parse_user_data)


def configure(bp, config, db):
    @bp.route("/stats/")
    def stats():
        wikis = db.campaigns.wikis()
        return render_template(
            "stats.html", wikis=sorted(list(wikis)),
            maintenance_notice=build_maintenance_notice(request, config))

    @bp.route("/stats/<wiki>/")
    def stats_wiki(wiki):
        script_tags = build_script_tags(assets.LIB_JS, config)
        style_tags = build_style_tags(assets.LIB_CSS, config)
        return render_template(
            "stats_wiki.html",
            wiki=wiki,
            script_tags=script_tags,
            style_tags=style_tags,
            campaigns=db.campaigns.for_wiki(wiki, True),
            maintenance_notice=build_maintenance_notice(request, config))

    @bp.route("/stats/<wiki>/<int:id>")
    def stats_wiki_campaign(wiki, id):
        script_tags = build_script_tags(assets.LIB_JS, config)
        style_tags = build_style_tags(assets.LIB_CSS, config)
        campaigns = db.campaigns.for_wiki(wiki, True)
        for campaign in campaigns:
            if campaign['id'] == id:
                break
        else:
            return responses.not_found()
        user_stats = []
        for case in db.campaigns.users(campaign['id']):
            user_stats.append(parse_user_data(case, config))
        return render_template(
            "stats_wiki_campaign.html",
            wiki=wiki,
            script_tags=script_tags,
            style_tags=style_tags,
            campaign=campaign,
            user_stats=user_stats,
            maintenance_notice=build_maintenance_notice(request, config))

    return bp
