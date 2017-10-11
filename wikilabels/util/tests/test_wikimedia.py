from .. import wikimedia

from nose.tools import eq_


def test_host_from_dbname():
    eq_(wikimedia.host_from_dbname('enwiki'), 'en.wikipedia.org')
    eq_(wikimedia.host_from_dbname('fawiki'), 'fa.wikipedia.org')
    eq_(wikimedia.host_from_dbname('wikidatawiki'), 'wikidata.org')
    eq_(wikimedia.host_from_dbname('labswiki'), 'wikitech.wikimedia.org')
