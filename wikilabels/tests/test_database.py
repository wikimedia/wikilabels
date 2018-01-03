import pytest
import os
from wikilabels.database import db
import yamlconf

item1 = {'wiki' : "cawiki", 'name' : "ching", 'form' : "chan", 'view' : "bivicyt", 'labels_per_task' : 1,'task_per_task' : 50, 'active' : True, 'info_url': "https://www.mediawiki.org/wiki/ORES#Edit_quality"}
db_ = db.DB(1, 5, database = "wikilabels", user = "wikilabels", password = "wikilabels-admin") #args untuk minconn dan maxconn. kwargs untuk beri nama user, dns, dll ada di laporan travis no 25
user = 608705


def test_campaign_showitem():
    item = db_.campaigns.create(item1.get('wiki'), item1.get('name'), item1.get('form'), item1.get('view'), item1.get('labels_per_task'), item1.get('task_per_task'), item1.get('active'), item1.get('info_url'))
    print(item.get('id'))
    gets = db.Campaigns.get(item.get('id'), True)
    print(gets)
    print(item1.get(6))
    assert False