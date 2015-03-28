import json

import mwoauth
from flask import Flask, request
from flask.ext.jsonpify import jsonify

from . import responses


def configure(config=None):
    config = config or {}

    app = Flask("revcoding")

    @app.route("/")
    def index():
        return "Welcome to the index page of the revision coder flask app."

    @app.route("/authorize/")
    def authorize():
        """
        Performs an OAuth handshake.  Needs access to mediawiki configuration
        """
        return "Authorize not implemented yet."

    @app.route("/oauth_callback/")
    def oauth_callback():
        """
        Completes the oauth handshake
        """
        return "OAuth callback not implemented yet."

    @app.route("/logout/")
    def logout():
        """
        Deletes the local session.
        """
        return "Logout not implemented yet."

    @app.route("/campaigns/<wiki>/", methods=["GET"])
    def get_wiki(wiki):
        """
        Returns a list of campaigns available for this particular wiki.
        """
        if 'create' in request.args:
            create_campaign(wiki, request.args['create'])
        else:
            return jsonify(
                {
                    "wiki": wiki,
                    "campaigns": [345, 376]
                }
            )

    @app.route("/campaigns/<wiki>/", methods=["POST"])
    def create_campaign(wiki, campaign):
        """
        Creates a new campaign
        """
        return "Create campaign not implemented yet."

    @app.route("/campaigns/<wiki>/<int:campaign>/", methods=["GET"])
    def get_campaign(wiki, campaign):
        """
        Returns metadata for a campaign or assign a new workset
        """
        if 'assign' in request.args:
            return assign_workset(wiki, campaign)
        else:
            return jsonify(
                {
                    "wiki": wiki,
                    "campaign": {
                        "id": campaign,
                        "name": "Edit quality -- 2014 10k sample",
                        "form": "damaging_and_goodfaith",
                        "view": "diff_to_previous",
                        "created": 1234567830,
                        "labels_per_task": 1,
                        "tasks": {
                            "labels": 10000,
                            "completed": 5723,
                            "assigned": 300
                        }
                    }
                }
            )

    @app.route("/campaigns/<wiki>/<int:campaign>/", methods=["POST"])
    def assign_workset(wiki, campaign):
        """
        Assigns and gathers metadata for a particular workset
        """
        return get_workset(wiki, campaign, 9001)

    @app.route("/campaigns/<wiki>/<int:campaign>/<int:workset>/", methods=["GET"])
    def get_workset(wiki, campaign, workset):
        """
        Gathers metadata for a particular workset
        """
        if 'abandon' in request.args:
            return jsonify({"success": True})

        if 'expand' in request.args:
            campaign = {
                "id": campaign,
                "name": "Edit quality -- 2014 10k sample",
                "form": "damaging_and_goodfaith",
                "view": "diff_to_previous",
                "created": 1234567830,
                "labels_per_task": 1,
                "tasks": {
                    "labels": 10000,
                    "completed": 5723,
                    "assigned": 300
                }
            }

        else:
            campaign = {"id": campaign}

        return jsonify(
            {
                "wiki": wiki,
                "campaign": campaign,
                "workset": {
                    "id": 1027,
                    "user_id": 607828,
                    "assigned": "2015-02-21T13:45:56Z",
                    "expiration": "2015-02-22T13:45:56Z",
                    "tasks": [
                        {"id": 102, "data": {"rev_id": 3456780}},
                        {"id": 103, "data": {"rev_id": 3456781}},
                        {"id": 104, "data": {"rev_id": 3456782}},
                        {"id": 105, "data": {"rev_id": 3456783}},
                        {"id": 106, "data": {"rev_id": 3456784}},
                        {"id": 107, "data": {"rev_id": 3456785}}
                    ]
                }
            }
        )

    @app.route("/campaigns/<wiki>/<int:campaign>/<int:workset>/<int:task>/", methods=["GET"])
    def get_task(wiki, campaign, workset, task):
        """
        Gets a task label
        """
        if 'label' in request.args:
            return label_task(wiki, campaign, workset, task, request.args['label'])

        else:
            if 'expand' in request.args:
                campaign = {
                    "id": campaign,
                    "name": "Edit quality -- 2014 10k sample",
                    "form": "damaging_and_goodfaith",
                    "view": "diff_to_previous",
                    "created": 1234567830,
                    "labels_per_task": 1,
                    "tasks": {
                        "labels": 10000,
                        "completed": 5723,
                        "assigned": 300
                    }
                }

            else:
                campaign = {"id": campaign}

            return jsonify(
                {
                    "wiki": wiki,
                    "campaign": campaign,
                    "task": {
                        "id": task,
                        "data": {"rev_id": 3456780}
                    },
                    "labels": [
                        {
                            "user_id": 607828,
                            "timestamp": 1244597890,
                            "data": {
                                "damaging": False,
                                "good-faith": True
                            }
                        }
                    ]
                }
            )

    @app.route("/campaigns/<wiki>/<int:campaign>/<int:workset>/<int:task>/",
               methods=["PUT", "POST"])
    def label_task(wiki, campaign, workset, task, label=None):
        """
        Adds a label to a workset task.
        """
        label = json.loads(request.form.get('label', label))

        if 'expand' in request.args:
            campaign = {
                "id": campaign,
                "name": "Edit quality -- 2014 10k sample",
                "form": "damaging_and_goodfaith",
                "view": "diff_to_previous",
                "created": 1234567830,
                "labels_per_task": 1,
                "tasks": {
                    "labels": 10000,
                    "completed": 5723,
                    "assigned": 300
                }
            }
            task = {
                "id": task,
                "data": {"rev_id": 3456780}
            }

        else:
            campaign = {"id": campaign}
            task = {"id": task}

        return jsonify({
            "wiki": wiki,
            "campaign": campaign,
            "task": task,
            "label": {
                "user_id": 607828,
                "timestamp": 1244597890,
                "data": {
                    "damaging": False,
                    "good-faith": True
                }
            }
        })

    @app.route("/forms/<form_name>", methods=['GET'])
    def get_form(form_name):
        if form_name == "damaging_and_goodfaith":
            return jsonify(
                {
                    'form': {
                        "fields": [
                            {
                                "id": "damaging",
                                "class": "revcoding.ui.RadioButtons",
                                "label": "rvc-damaging",
                                "help": "rvc-damaging-title",
                                "options": [
                                    {
                                        "label": "rvc-damaging-yes",
                                        "tooltip": "rvc-damaging-yes-title",
                                        "value": 1
                                    },
                                    {
                                        "label": "rvc-damaging-no",
                                        "tooltip": "rvc-damaging-no-title",
                                        "value": 0
                                    }
                                ]
                            },
                            {
                                "id": "good-faith",
                                "class": "revcoding.ui.RadioButtons",
                                "label": "rvc-good-faith",
                                "help": "rvc-good-faith-title",
                                "options": [
                                    {
                                        "label": "rvc-good-faith-yes",
                                        "tooltip": "rvc-good-faith-yes-title",
                                        "value": 1
                                    },
                                    {
                                        "label": "rvc-good-faith-no",
                                        "tooltip": "rvc-good-faith-no-title",
                                        "value": 0
                                    }
                                ]
                            }
                        ],
                        "i18n": {
                            "az": {
                                "rvc-work-set": "Veri kümesi:",
                                "rvc-damaging": "Zararlı mı?",
                                "rvc-damaging-title": "Değişiklik maddeye zarar verdi mi?",
                                "rvc-damaging-yes": "Evet",
                                "rvc-damaging-yes-title": "Evet bu değişiklik zararlı ve düzeltilmeli veya geri alınmalı.",
                                "rvc-damaging-no": "Hayır",
                                "rvc-damaging-no-title": "Hayır bu değişiklik zararlı değil ve olduğu gibi kalmalı.",
                                "rvc-good-faith": "İyi niyetli mi?",
                                "rvc-good-faith-title": "Bu kullanıcının yaptığı değişiklik yarar sağlama amaçlı mı gözüküyor?",
                                "rvc-good-faith-yes": "Evet",
                                "rvc-good-faith-yes-title": "Evet bu değişiklik iyi niyetli gibi gözüküyor.",
                                "rvc-good-faith-no": "Hayır",
                                "rvc-good-faith-no-title": "Hayır bu değişiklik kötü niyetli gibi gözüküyor.",
                                "rvc-revision-title": "Değişiklik: $1",
                                "rvc-submit": "Yolla",
                                "rvc-dataset-completed": "Bu veri kümesini incelemeyi tamamladınız!"
                            },
                            "en": {
                                "rvc-work-set": "Work set:",
                                "rvc-damaging": "Damaging?",
                                "rvc-damaging-title": "Did this edit cause damage to the article?",
                                "rvc-damaging-yes": "Yes",
                                "rvc-damaging-yes-title": "Yes, this edit is damaging and should be fixed or reverted.",
                                "rvc-damaging-no": "No",
                                "rvc-damaging-no-title": "No, this edit is not damaging and can be kept as is.",
                                "rvc-good-faith": "Good faith?",
                                "rvc-good-faith-title": "Does it appear as though the author of this edit was trying to contribute productively?",
                                "rvc-good-faith-yes": "Yes",
                                "rvc-good-faith-yes-title": "Yes, this edit appears to have been made in good-faith.",
                                "rvc-good-faith-no": "No",
                                "rvc-good-faith-no-title": "No, this edit appears to have been made in bad-faith.",
                                "rvc-revision-title": "Revision: $1",
                                "rvc-submit": "Submit",
                                "rvc-dataset-completed": "You completed this dataset!"
                            },
                            "fa": {
                                "rvc-work-set": "مجموعهٔ کار:",
                                "rvc-damaging": "خرابکاری?",
                                "rvc-damaging-title": "آیا ویرایش باعث خراب شدن مقاله شده‌است؟",
                                "rvc-damaging-yes": "بله",
                                "rvc-damaging-yes-title": "بله، این ویرایش باعث خراب شدن مقاله شده‌است و باید واگردانی شود",
                                "rvc-damaging-no": "نه",
                                "rvc-damaging-no-title": "نه، باید این ویرایش همین‌گونه باشد.",
                                "rvc-good-faith": "با فرض حسن نیت؟",
                                "rvc-good-faith-title": "آیا کاربر ویرایشگر با حسن نیست ویرایش کرده و سازنده بوده است؟",
                                "rvc-good-faith-yes": "بله",
                                "rvc-good-faith-yes-title": "بله، این ویرایش به نظرم با حسن نیت انجام شده‌است.",
                                "rvc-good-faith-no": "نه",
                                "rvc-good-faith-no-title": "نه، این ویرایش با حسن نیست نبوده است",
                                "rvc-revision-title": "نسخه: $1",
                                "rvc-submit": "بارگذاری",
                                "rvc-dataset-completed": "شما مجموعه داده‌ها را کامل کردید!"
                            },
                            "pt": {
                                "rvc-work-set": "Conjunto de trabalho:",
                                "rvc-damaging": "Prejudicial?",
                                "rvc-damaging-title": "Esta edição prejudicou o artigo?",
                                "rvc-damaging-yes": "Sim",
                                "rvc-damaging-yes-title": "Sim, esta edição é prejudicial e deveria ser corrigida ou revertida.",
                                "rvc-damaging-no": "Não",
                                "rvc-damaging-no-title": "Não, esta edição não é prejudicial e pode ser mantida como está.",
                                "rvc-good-faith": "De boa fé?",
                                "rvc-good-faith-title": "Parece que o autor desta edição estava tentando contribuir produtivamente?",
                                "rvc-good-faith-yes": "Sim",
                                "rvc-good-faith-yes-title": "Sim, esta edição parece ter sido feita de boa fé.",
                                "rvc-good-faith-no": "Não",
                                "rvc-good-faith-no-title": "Não, esta edição parece ter sido feita de má fé.",
                                "rvc-revision-title": "Revisão: $1",
                                "rvc-submit": "Submeter",
                                "rvc-dataset-completed": "Você completou este conjunto de dados!"
                            },
                            "tr": {
                                "rvc-work-set": "Veri kümesi:",
                                "rvc-damaging": "Zararlı mı?",
                                "rvc-damaging-title": "Değişiklik maddeye zarar verdi mi?",
                                "rvc-damaging-yes": "Evet",
                                "rvc-damaging-yes-title": "Evet bu değişiklik zararlı ve düzeltilmeli veya geri alınmalı.",
                                "rvc-damaging-no": "Hayır",
                                "rvc-damaging-no-title": "Hayır bu değişiklik zararlı değil ve olduğu gibi kalmalı.",
                                "rvc-good-faith": "İyi niyetli mi?",
                                "rvc-good-faith-title": "Bu kullanıcının yaptığı değişiklik yarar sağlama amaçlı mı gözüküyor?",
                                "rvc-good-faith-yes": "Evet",
                                "rvc-good-faith-yes-title": "Evet bu değişiklik iyi niyetli gibi gözüküyor.",
                                "rvc-good-faith-no": "Hayır",
                                "rvc-good-faith-no-title": "Hayır bu değişiklik kötü niyetli gibi gözüküyor.",
                                "rvc-revision-title": "Değişiklik: $1",
                                "rvc-submit": "Yolla",
                                "rvc-dataset-completed": "Bu veri kümesini incelemeyi tamamladınız!"
                            }
                        }
                    }
                }
            )
        else:
            return responses.error(404, "bad_name",
                                   "Can't find a form named '{0}'" \
                                   .format(form_name))

    return app
