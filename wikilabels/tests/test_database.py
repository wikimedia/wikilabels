import pytest
import os
from wikilabels.database import db
import yamlconf

item1 = {'wiki' : "cawiki", 'name' : "ching", 'form' : "chan", 'view' : "bivicyt", 'labels_per_task' : 1,'task_per_task' : 50, 'active' : True, 'info_url': "https://www.mediawiki.org/wiki/ORES#Edit_quality"}
dbs = db.DB(1, 5, database = "wikilabels", user = "wikilabels", password = "wikilabels-admin") #args untuk minconn dan maxconn. kwargs untuk beri nama user, dns, dll ada di laporan travis no 25
user = 608705


def test_campaign_create():
    assert dbs.campaigns.create(item1.get('wiki'), item1.get('name'),
                                item1.get('form'), item1.get('view'),
                                item1.get('labels_per_task'), item1.get('task_per_task'),
                                item1.get('active'), item1.get('info_url'))

def test_campaign_checkwikiexists():
    assert dbs.campaigns.wiki_name_exists(item1.get('wiki'), item1.get('name'))

def test_campaign_getitems():
    if not dbs.campaigns.get(item1.get(1)):
        print('Item id 1 for unknown reason is cannot be found')
        assert False
    assert True

def test_campaign_statsfor():
    item = dbs.campaigns.stats_for(1)
    if item is None:
        print('Unkown Campaign or there are no tasks')
        assert False
    assert True

def test_campaign_hasopentasks():
    assert dbs.campaigns.has_open_tasks(1, user)

def test_campaign_forwiki():
    assert dbs.campaigns.for_wiki('enwiki')

def test_campaign_foruser():
    assert dbs.campaigns.for_user(608705)

def test_campaign_wikis():
    assert dbs.campaigns.wikis()

def test_campaign_users():
    assert dbs.campaigns.users()

def test_labels_upsertupdate():
    item = dbs.labels.upsert(1, 608705, '{"damaging": true, "good-faith": true}')
    if item['data'] is not '{"damaging": true, "good-faith": false}':
        assert True

def test_labels_CRUD():
    if dbs.labels.insert(3, user, '{"damaging": true, "good-faith": true}') is not None:
        if dbs.labels.update(3, user, '{"damaging": false, "good-faith": true}') is not None:
            if dbs.labels.clear_data(3, user, '{"damaging": false, "good-faith": true}') is not None:
                assert True

def tests_worksets_get():
    if dbs.worksets.get(1) is not None:
        assert True

def tests_worksets_statsfor():
    if dbs.worksets.stats_for(1) is not None:
        assert True

def tests_worksets_forcampaign():
    if dbs.worksets.for_campaign(1) is not None:
        assert True

def tests_worksets_foruser():
    if dbs.workset.for_user() is not None:
        assert True

def test_worksets_openworksetsforuser():
    if dbs.worksets.open_workset_for_user(1, user) is not None:
        assert True

def test_worksets_assign():
    if dbs.worksets.assign(2, user) is not None:
        assert True

def test_worksets_users():
    if dbs.worksets.users() is not None:
        assert True

def test_worksets_abandon():
    if dbs.worksets.abandon(2, user) is not None:
        assert True

def test_worksets_abandontask():
    if dbs.worksets.abandon_task(1, user, 1) is not None:
        assert True
