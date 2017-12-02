from .routes_fixture import app  # noqa


def test_campaigns(client):
    response = client.get("/campaigns/")
    assert response._status_code == 200

    result = response.json
    assert 'info' in result
    assert 'wikis' in result
