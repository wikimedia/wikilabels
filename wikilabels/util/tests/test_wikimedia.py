from .. import wikimedia


def test_host_from_dbname():
    assert wikimedia.host_from_dbname('enwiki') == 'en.wikipedia.org'
    assert wikimedia.host_from_dbname('fawiki') == 'fa.wikipedia.org'
    assert wikimedia.host_from_dbname('wikidatawiki') == 'wikidata.org'
    assert wikimedia.host_from_dbname('labswiki') == 'wikitech.wikimedia.org'
    assert wikimedia.host_from_dbname('bnwikisource') == 'bn.wikisource.org'
