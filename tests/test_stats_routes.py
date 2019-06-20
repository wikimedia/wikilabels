from .routes_test_fixture import app  # noqa


def test_stats_wiki_campaign(client):
    # test active campaign
    assert client.get("/stats/enwiki/1")._status_code == 200
    # test archived campaign
    assert client.get("/stats/enwiki/7")._status_code == 200

def test_stats(client):
    assert client.get("/stats/")._status_code == 200
