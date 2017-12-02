from .routes_fixture import app  # noqa


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
