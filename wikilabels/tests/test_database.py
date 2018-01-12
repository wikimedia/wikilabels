from wikilabels.database import db

item1 = {'wiki': "cawiki", 'name': "ching", 'form': "chan",
         'view': "bivicyt", 'labels_per_task': 1,
         'task_per_task': 50, 'active': True,
         'info_url': "https://www.mediawiki.org/wiki/ORES#Edit_quality"}

dbs = db.DB(1, 5, database="wikilabels",
            user="wikilabels", password="wikilabels-admin")
# args untuk minconn dan maxconn.
# kwargs untuk beri nama user, dns, dll ada di laporan travis no 25

user = 608705


def test_campaign_create():
    assert dbs.campaigns.create(item1.get('wiki'), item1.get('name'),
                                item1.get('form'), item1.get('view'),
                                item1.get('labels_per_task'),
                                item1.get('task_per_task'),
                                item1.get('active'), item1.get('info_url'))


def test_campaign_checkwikiexists():
    assert dbs.campaigns.wiki_name_exists(item1.get('wiki'), item1.get('name'))


def test_campaign_getitems():
    assert dbs.campaigns.get(1)


def test_campaign_statsfor():
    assert dbs.campaigns.stats_for(1)


def test_campaign_hasopentasks():
    assert dbs.campaigns.has_open_tasks(1, user)


def test_campaign_forwiki():
    assert dbs.campaigns.for_wiki('enwiki')


def test_campaign_foruser():
    assert dbs.campaigns.for_user(608705)


def test_campaign_wikis():
    assert dbs.campaigns.wikis()


def test_campaign_users():
    assert dbs.campaigns.users(1)


def test_labels_upsertupdate():
    assert dbs.labels.upsert(1, 608705,
                             {"damaging": true,
                             "good-faith": true})


def test_labels_CRUD():
    assert dbs.labels.insert(3, user, '{"damaging": true, "good-faith": true}')
    assert dbs.labels.update(3, user,
                             '{"damaging": false, "good-faith": true}')
    assert dbs.labels.clear_data(3, user)


def tests_worksets_get():
    assert dbs.worksets.get(1)


def tests_worksets_statsfor():
    assert dbs.worksets.stats_for(1)


def tests_worksets_forcampaign():
    assert dbs.worksets.for_campaign(1)


def tests_worksets_foruser():
    assert dbs.worksets.for_user(user)


def test_worksets_openworksetsforuser():
    assert dbs.worksets.open_workset_for_user(1, user)


def test_worksets_assign():
    assert dbs.worksets.assign(2, user)


def test_worksets_users():
    assert dbs.worksets.users()


def test_worksets_abandon():
    assert dbs.worksets.abandon(1, user)


def test_worksets_abandontask():
    assert dbs.worksets.abandon_task(1, user, 1)
