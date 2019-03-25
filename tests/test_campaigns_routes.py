from copy import deepcopy

from .routes_test_fixture import app, REPLACED_DATE_TEXT  # noqa


# Expected response when we send a GET request to `/campaigns/enwiki/`
# except for the `replaced_created_data`, it's replaced for testing purposes.
expected_enwiki_resp = {
    'campaigns': [{'active': True,
                   'created': REPLACED_DATE_TEXT,
                   'form': 'draft_notability',
                   'id': 5,
                   'info_url': '',
                   'labels_per_task': 1,
                   'name': 'Draft notability (raw)',
                   'tasks_per_assignment': 10,
                   'view': 'ParsedWikitext',
                   'wiki': 'enwiki'},
                  {'active': True,
                   'created': REPLACED_DATE_TEXT,
                   'form': 'draft_notability',
                   'id': 4,
                   'info_url': '',
                   'labels_per_task': 1,
                   'name': 'Draft notability',
                   'tasks_per_assignment': 10,
                   'view': 'PageAsOfRevision',
                   'wiki': 'enwiki'},
                  {'active': True,
                   'created': REPLACED_DATE_TEXT,
                   'form': 'edit_type',
                   'id': 2,
                   'info_url': '',
                   'labels_per_task': 1,
                   'name': 'Edit Type -- 2015 january sample',
                   'tasks_per_assignment': 10,
                   'view': 'DiffToPrevious',
                   'wiki': 'enwiki'},
                  {'active': True,
                   'created': REPLACED_DATE_TEXT,
                   'form': 'damaging_and_goodfaith',
                   'id': 1,
                   'info_url': '',
                   'labels_per_task': 1,
                   'name': 'Edit Quality -- 2014 10k sample',
                   'tasks_per_assignment': 10,
                   'view': 'DiffToPrevious',
                   'wiki': 'enwiki'}],
    'wiki': 'enwiki'}

# GET /campaigns/nlwiki/
expected_nlwiki_resp = {
    'campaigns': [{'active': True,
                   'created': REPLACED_DATE_TEXT,
                   'form': 'damaging_and_goodfaith',
                   'id': 6,
                   'info_url': '',
                   'labels_per_task': 1,
                   'name': 'Edit Quality -- 2014 10k nlwiki',
                   'tasks_per_assignment': 10,
                   'view': 'DiffToPrevious',
                   'wiki': 'nlwiki'}],
    'wiki': 'nlwiki'}

# GET /campaigns/ptwiki/
expected_ptwiki_resp = {
    'campaigns': [{'active': True,
                   'created': REPLACED_DATE_TEXT,
                   'form': 'damaging_and_goodfaith',
                   'id': 3,
                   'info_url': '',
                   'labels_per_task': 1,
                   'name': ('Qualidade das edições -- Amostra de 10k'
                            ' revisões de 2014'),
                   'tasks_per_assignment': 10,
                   'view': 'DiffToPrevious',
                   'wiki': 'ptwiki'}],
    'wiki': 'ptwiki'}

# GET /campaigns/enwiki/1/
expected_campaign_1_resp = {
    'campaign': {'active': True,
                 'created': REPLACED_DATE_TEXT,
                 'form': 'damaging_and_goodfaith',
                 'id': 1,
                 'info_url': '',
                 'labels_per_task': 1,
                 'name': 'Edit Quality -- 2014 10k sample',
                 'tasks_per_assignment': 10,
                 'view': 'DiffToPrevious',
                 'wiki': 'enwiki'}}

# GET /campaigns/enwiki/1/?worksets
expected_campaign_1_with_worksets_resp = (
    deepcopy(expected_campaign_1_resp)
)
expected_campaign_1_with_worksets_resp.update({
    'worksets': [{'campaign_id': 1,
                  'created': REPLACED_DATE_TEXT,
                  'expires': REPLACED_DATE_TEXT,
                  'id': 1,
                  'user_id': 608705}]})

# GET /campaigns/enwiki/1/?tasks
expected_campaign_1_with_tasks_resp = (
    deepcopy(expected_campaign_1_resp)
)
expected_campaign_1_with_tasks_resp.update({
    'tasks': [{'campaign_id': 1,
               'data': {'rev_id': 647263235},
               'id': 1,
               'labels': [{'data': {'damaging': True,
                                    'good-faith': False},
                           'timestamp': REPLACED_DATE_TEXT,
                           'user_id': 608705}]},
              {'campaign_id': 1,
               'data': {'rev_id': 647454074},
               'id': 2,
               'labels': [{'data': {'damaging': False,
                                    'good-faith': True},
                           'timestamp': REPLACED_DATE_TEXT,
                           'user_id': 608705}]},
              {'campaign_id': 1,
               'data': {'rev_id': 649712507},
               'id': 3,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 648970723},
               'id': 4,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 646862075},
               'id': 5,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 646838927},
               'id': 6,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647884405},
               'id': 7,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 649753552},
               'id': 8,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 648359119},
               'id': 9,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647954394},
               'id': 10,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647542647},
               'id': 11,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 649169018},
               'id': 12,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 649520794},
               'id': 13,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647935640},
               'id': 14,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 646661161},
               'id': 15,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 650067396},
               'id': 16,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 645990834},
               'id': 17,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647271993},
               'id': 18,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 646343079},
               'id': 19,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 649639740},
               'id': 20,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 646575545},
               'id': 21,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 646642569},
               'id': 22,
               'labels': [{'data': {'damaging': True,
                                    'good-faith': False},
                           'timestamp': REPLACED_DATE_TEXT,
                           'user_id': 555755}]},
              {'campaign_id': 1,
               'data': {'rev_id': 646932685},
               'id': 23,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647071350},
               'id': 24,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 649503290},
               'id': 25,
               'labels': []},
              {'campaign_id': 1,
               'data': {'rev_id': 647310240},
               'id': 26,
               'labels': []}]
})

# GET /campaigns/enwiki/1/?worksets&tasks
expected_campaign_1_with_tasks_and_worksets_resp = (
    deepcopy(expected_campaign_1_with_worksets_resp)
)
expected_campaign_1_with_tasks_and_worksets_resp.update(
    expected_campaign_1_with_tasks_resp
)

# GET /campaigns/enwiki/1/1/
expected_campaign_1_workset_1_resp = {
    'workset': {'campaign_id': 1,
                'created': REPLACED_DATE_TEXT,
                'expires': REPLACED_DATE_TEXT,
                'id': 1,
                'user_id': 608705}}

# GET /campaigns/enwiki/1/1/?campaign
expected_campaign_1_workset_1_with_campaign_resp = (
    deepcopy(expected_campaign_1_workset_1_resp)
)
expected_campaign_1_workset_1_with_campaign_resp.update(
    expected_campaign_1_resp)

# GET /campaigns/enwiki/1/1/?campaign=stats
expected_campaign_1_workset_1_campaign_stats = (
    deepcopy(expected_campaign_1_workset_1_with_campaign_resp)
)
expected_campaign_1_workset_1_campaign_stats['campaign']['stats'] = {
    'assignments': 10,
    'coders': 2,
    'labels': 3,
    'tasks': 26}

# GET /campaigns/enwiki/1/1/?tasks
expected_campaign_1_workset_1_with_tasks_resp = (
    deepcopy(expected_campaign_1_workset_1_resp)
)
expected_campaign_1_workset_1_with_tasks_resp.update({
    'tasks': [{'campaign_id': 1,
               'data': {'rev_id': 647263235},
               'id': 1,
               'labels': [{'data': {'damaging': True, 'good-faith': False},
                           'timestamp': REPLACED_DATE_TEXT,
                           'user_id': 608705}]},
              {'campaign_id': 1,
                  'data': {'rev_id': 647454074},
                  'id': 2,
                  'labels': [{'data': {'damaging': False, 'good-faith': True},
                              'timestamp': REPLACED_DATE_TEXT,
                              'user_id': 608705}]},
              {'campaign_id': 1,
                  'data': {'rev_id': 649712507},
                  'id': 3,
                  'labels': []},
              {'campaign_id': 1,
                  'data': {'rev_id': 648970723},
                  'id': 4,
                  'labels': []},
              {'campaign_id': 1,
                  'data': {'rev_id': 646862075},
                  'id': 5,
                  'labels': []}]})

# GET /campaigns/enwiki/1/1/?campaign&tasks
expected_campaign_1_workset_1_with_campaign_and_tasks_resp = (
    deepcopy(expected_campaign_1_workset_1_with_campaign_resp)
)
expected_campaign_1_workset_1_with_campaign_and_tasks_resp.update(
    expected_campaign_1_workset_1_with_tasks_resp
)

# GET /campaigns/enwiki/1/1/?campaign=stats&tasks
expected_campaign_1_workset_1_with_campaign_stats_and_tasks_resp = (
    deepcopy(expected_campaign_1_workset_1_campaign_stats)
)
expected_campaign_1_workset_1_with_campaign_stats_and_tasks_resp.update(
    expected_campaign_1_workset_1_with_tasks_resp
)

# GET /campaigns/enwiki/1/1/1/
expected_campaign_1_workset_1_task_1_resp = {
    'task': {'campaign_id': 1,
             'data': {'rev_id': 647263235},
             'id': 1,
             'labels': [{'data': {'damaging': True, 'good-faith': False},
                         'timestamp': REPLACED_DATE_TEXT,
                         'user_id': 608705}]}}

# GET /campaigns/enwiki/1/1/1/?campaign
expected_campaign_1_workset_1_task_1_campaign_resp = (
    deepcopy(expected_campaign_1_workset_1_task_1_resp)
)
expected_campaign_1_workset_1_task_1_campaign_resp.update(
    expected_campaign_1_resp
)

# GET /campaigns/enwiki/1/1/1/?campaign=stats
expected_campaign_1_workset_1_task_1_stats_resp = (
    deepcopy(expected_campaign_1_workset_1_task_1_campaign_resp)
)
expected_campaign_1_workset_1_task_1_stats_resp['campaign']['stats'] = {
    'assignments': 10,
    'coders': 2,
    'labels': 3,
    'tasks': 26}

# GET /campaigns/enwiki/1/1/1/?workset
expected_campaign_1_workset_1_task_1_workset_resp = (
    deepcopy(expected_campaign_1_workset_1_task_1_resp)
)
expected_campaign_1_workset_1_task_1_workset_resp.update(
    {'workset': {'campaign_id': 1,
                 'created': REPLACED_DATE_TEXT,
                 'expires': REPLACED_DATE_TEXT,
                 'id': 1,
                 'user_id': 608705}}
)

# GET /campaigns/enwiki/1/1/1/?campaign&workset
expected_campaign_1_workset_1_task_1_campaign_and_workset_resp = (
    deepcopy(expected_campaign_1_workset_1_task_1_campaign_resp)
)
expected_campaign_1_workset_1_task_1_campaign_and_workset_resp.update(
    expected_campaign_1_workset_1_task_1_workset_resp
)

# GET /campaigns/enwiki/1/1/1/?campaign=stats&workset
expected_campaign_1_workset_1_task_1_stats_and_workset_resp = (
    deepcopy(expected_campaign_1_workset_1_task_1_campaign_and_workset_resp)
)
expected_campaign_1_workset_1_task_1_stats_and_workset_resp.update(
    expected_campaign_1_workset_1_task_1_stats_resp
)


def replace_date_in_resp_json(resp_json):
    def replace_date_in_workset_dict(workset_dict):
        workset_dict['created'] = REPLACED_DATE_TEXT
        workset_dict['expires'] = REPLACED_DATE_TEXT

    def replace_date_in_task_dict(task_dict):
        for label in task_dict['labels']:
            label['timestamp'] = REPLACED_DATE_TEXT

    def replace_date_in_campaign_dict(campaign_dict):
        campaign_dict['created'] = REPLACED_DATE_TEXT

    if 'campaign' in resp_json:
        replace_date_in_campaign_dict(resp_json['campaign'])
    if 'workset' in resp_json:
        replace_date_in_workset_dict(resp_json['workset'])
    if 'task' in resp_json:
        replace_date_in_task_dict(resp_json['task'])

    if 'campaigns' in resp_json:
        for campaign in resp_json['campaigns']:
            replace_date_in_campaign_dict(campaign)
    if 'worksets' in resp_json:
        for workset in resp_json['worksets']:
            replace_date_in_workset_dict(workset)
    if 'tasks' in resp_json:
        for task in resp_json['tasks']:
            replace_date_in_task_dict(task)


def test_campaigns(client):
    response = client.get("/campaigns/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'wikis' in result
    assert result['wikis'] == ['enwiki', 'nlwiki', 'ptwiki']


def test_get_wiki(client):
    enwiki_response = client.get('/campaigns/enwiki/')
    nlwiki_response = client.get('/campaigns/nlwiki/')
    ptwiki_response = client.get('/campaigns/ptwiki/')

    assert enwiki_response._status_code == 200
    assert nlwiki_response._status_code == 200
    assert ptwiki_response._status_code == 200

    enwiki_resp_json = enwiki_response.json
    replace_date_in_resp_json(enwiki_resp_json)
    assert enwiki_resp_json == expected_enwiki_resp

    nlwiki_resp_json = nlwiki_response.json
    replace_date_in_resp_json(nlwiki_resp_json)
    assert nlwiki_resp_json == expected_nlwiki_resp

    ptwiki_resp_json = ptwiki_response.json
    replace_date_in_resp_json(ptwiki_resp_json)
    assert ptwiki_resp_json == expected_ptwiki_resp


def test_get_wiki_with_campaigns_stats(client):
    enwiki_response = client.get('/campaigns/enwiki/?campaigns=stats')

    assert enwiki_response._status_code == 200

    enwiki_resp_json = enwiki_response.json
    assert enwiki_resp_json['wiki'] == 'enwiki'

    for campaign in enwiki_resp_json['campaigns']:
        assert 'stats' in campaign


def test_get_campaign(client):
    enwiki_campaign_1_resp = client.get('/campaigns/enwiki/1/')

    assert enwiki_campaign_1_resp._status_code == 200

    resp_json = enwiki_campaign_1_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_resp


def test_get_campaign_with_tasks(client):
    enwiki_campaign_1_tasks_resp = client.get('/campaigns/enwiki/1/?tasks')

    assert enwiki_campaign_1_tasks_resp._status_code == 200

    resp_json = enwiki_campaign_1_tasks_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_with_tasks_resp

    for task in resp_json['tasks']:
        assert task['campaign_id'] == 1


def test_get_campaign_with_worksets(client):
    resp = client.get(
        '/campaigns/enwiki/1/?worksets')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_with_worksets_resp


def test_get_campaign_with_tasks_and_worksets(client):
    resp = client.get(
        '/campaigns/enwiki/1/?worksets&tasks')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_with_tasks_and_worksets_resp)


def test_get_campaign_not_found(client):
    not_exist_campaign_resp = client.get('/campaigns/enwiki/999/')

    assert not_exist_campaign_resp._status_code == 404
    assert not_exist_campaign_resp.json == {
        'error': {'code': 'not found', 'message': 'campaign_id=999'}}


def test_get_workset(client):
    resp = client.get('/campaigns/enwiki/1/1/')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_workset_1_resp


def test_get_workset_with_campaign(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/?campaign')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_workset_1_with_campaign_resp)


def test_get_workset_with_campaign_stats(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/?campaign=stats')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_workset_1_campaign_stats


def test_get_workset_with_tasks(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/?tasks')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_workset_1_with_tasks_resp)


def test_get_workset_with_campaign_and_tasks(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/?campaign&tasks')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_workset_1_with_campaign_and_tasks_resp)


def test_get_workset_with_campaign_stats_and_tasks(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/?campaign=stats&tasks')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_workset_1_with_campaign_stats_and_tasks_resp)


def test_get_workset_not_found(client):
    not_exist_workset_resp = client.get('/campaigns/enwiki/1/999/')

    assert not_exist_workset_resp._status_code == 404
    assert not_exist_workset_resp.json == {
        'error': {'code': 'not found', 'message': 'workset_id=999'}}


def test_get_task(client):
    resp = client.get('/campaigns/enwiki/1/1/1/')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_workset_1_task_1_resp


def test_get_task_with_campaign(client):
    enwiki_campaign_1_workset_1_task_1_campaign_resp = client.get(
        '/campaigns/enwiki/1/1/1/?campaign')

    assert enwiki_campaign_1_workset_1_task_1_campaign_resp._status_code == 200

    resp_json = enwiki_campaign_1_workset_1_task_1_campaign_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_workset_1_task_1_campaign_resp


def test_get_task_with_campaign_stats(client):
    enwiki_campaign_1_workset_1_task_1_stats_resp = client.get(
        '/campaigns/enwiki/1/1/1/?campaign=stats')

    assert enwiki_campaign_1_workset_1_task_1_stats_resp._status_code == 200

    resp_json = enwiki_campaign_1_workset_1_task_1_stats_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_workset_1_task_1_stats_resp


def test_get_task_with_workset(client):
    enwiki_campaign_1_workset_1_task_1_workset_resp = client.get(
        '/campaigns/enwiki/1/1/1/?workset')

    assert enwiki_campaign_1_workset_1_task_1_workset_resp._status_code == 200

    resp_json = enwiki_campaign_1_workset_1_task_1_workset_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_campaign_1_workset_1_task_1_workset_resp


def test_get_task_with_campaign_and_workset(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/1/?campaign&workset')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_workset_1_task_1_campaign_and_workset_resp)


def test_get_task_with_campaign_stats_and_workset(client):
    resp = client.get(
        '/campaigns/enwiki/1/1/1/?campaign=stats&workset')

    assert resp._status_code == 200

    resp_json = resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == (
        expected_campaign_1_workset_1_task_1_stats_and_workset_resp
    )


def test_get_task_not_found(client):
    not_exist_task_resp = client.get('/campaigns/enwiki/1/1/999/')

    assert not_exist_task_resp._status_code == 404
    assert not_exist_task_resp.json == {
        'error': {'message': 'task_id=999', 'code': 'not found'}}
