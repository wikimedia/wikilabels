import pytest
import os
import yamlconf
import glob

from ..wsgi import server


@pytest.fixture
def app():
    config_paths = os.path.join('config/', "*.yaml")
    config = yamlconf.load(*(open(p) for p in sorted(glob.glob(config_paths))))
    return server.configure(config)


def test_root(client):
    assert client.get("/")._status_code == 200


def test_auth(client):
    response = client.get("/auth/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'initiate' in result['paths']
    assert 'whoami' in result['paths']
    assert 'logout' in result['paths']


def test_campaigns(client):
    response = client.get("/campaigns/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'wikis' in result


def test_form_builder(client):
    assert client.get("/form_builder/")._status_code == 200


def test_forms(client):
    response = client.get("/forms/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'damaging_and_goodfaith' in result['forms']
    assert 'draft_notability' in result['forms']
    assert 'edit_type' in result['forms']


def test_forms_form(client):
    response = client.get("/forms/damaging_and_goodfaith/")
    assert response._status_code == 200

    form = response.json['form']
    assert form['name'] == 'damaging_and_goodfaith'
    assert form['title'] == '<form-title>'
    assert 'i18n' in form
    assert len(form['fields']) > 0


def test_gadget(client):
    assert client.get("/gadget/")._status_code == 200


def test_stats(client):
    assert client.get("/stats/")._status_code == 200


def test_ui(client):
    assert client.get("/ui/")._status_code == 200


def test_users(client):
    response = client.get("/users/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'users' in result


def test_versions(client):
    assert client.get("/versions/")._status_code == 200
