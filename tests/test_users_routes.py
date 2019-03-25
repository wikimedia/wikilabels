from copy import deepcopy

from .routes_test_fixture import app, REPLACED_DATE_TEXT  # noqa
from .test_campaigns_routes import replace_date_in_resp_json

# GET /users/555755/
expected_user_555755_resp = {
    "user": {
        "id": 555755
    }
}

# GET /users/555755/?worksets
expected_user_555755_worksets_resp = (
    deepcopy(expected_user_555755_resp)
)
expected_user_555755_worksets_resp.update({
    'worksets': [{'campaign_id': 3,
                  'created': REPLACED_DATE_TEXT,
                  'expires': REPLACED_DATE_TEXT,
                  'id': 2,
                  'user_id': 555755}]}
)

# GET /users/555755/?tasks
expected_user_555755_tasks_resp = (
    deepcopy(expected_user_555755_resp)
)
expected_user_555755_tasks_resp.update(
    {'tasks': [{'campaign_id': 1,
                'data': {'rev_id': 646575545},
                'id': 21,
                'labels': []},
               {'campaign_id': 1,
                'data': {'rev_id': 646642569},
                'id': 22,
                'labels': [{'data': {'damaging': True, 'good-faith': False},
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
                'labels': []}]})


def test_users(client):
    response = client.get("/users/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'users' in result


def test_get_user(client):
    user_555755_resp = client.get('/users/555755/')

    assert user_555755_resp._status_code == 200
    assert user_555755_resp.json == expected_user_555755_resp


def test_get_user_with_worksets(client):
    user_555755_worksets_resp = client.get('/users/555755/?worksets')

    assert user_555755_worksets_resp._status_code == 200

    resp_json = user_555755_worksets_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_user_555755_worksets_resp


def test_get_user_with_tasks(client):
    user_555755_tasks_resp = client.get('/users/555755/?tasks')

    assert user_555755_tasks_resp._status_code == 200

    resp_json = user_555755_tasks_resp.json
    replace_date_in_resp_json(resp_json)
    assert resp_json == expected_user_555755_tasks_resp
