import re

HOST_EXCEPTIONS = {
    'mediawikiwiki': "mediawiki.org",
    'wikidatawiki': "wikidata.org",
    'commonswiki': "commons.wikimedia.org",
    'metawiki': "meta.wikimedia.org",
    'specieswiki': "species.wikimedia.org",
    'wikisourcewiki': "wikisource.org",
    'incubatorwiki': "incubator.wikimedia.org",
    'labswiki': "wikitech.wikimedia.org",
    'foundationwiki': "wikimediafoundation.org"
}

HOST_RULES = (
    (re.compile(r'(.*)wiki$'),
     lambda match: match.group(1) + ".wikipedia.org"),
    (re.compile(r'(.*)wiktionary$'),
     lambda match: match.group(1) + ".wiktionary.org"),
    (re.compile(r'(.*)wikinews$'),
     lambda match: match.group(1) + ".wikinews.org"),
    (re.compile(r'(.*)wikiquote$'),
     lambda match: match.group(1) + ".wikiquote.org"),
    (re.compile(r'(.*)wikibooks$'),
     lambda match: match.group(1) + ".wikibooks.org"),
    (re.compile(r'(.*)wikiversity$'),
     lambda match: match.group(1) + ".wikiversity.org"),
    (re.compile(r'(.*)wikivoyage$'),
     lambda match: match.group(1) + ".wikivoyage.org"),
    (re.compile(r'(.*)wikisource$'),
     lambda match: match.group(1) + ".wikisource.org")
)


def host_from_dbname(dbname):
    if dbname in HOST_EXCEPTIONS:
        return HOST_EXCEPTIONS[dbname]
    else:
        for regex, apply_rule in HOST_RULES:
            match = regex.match(dbname)
            if match is not None:
                return apply_rule(match)


def get_extra_modules(dbname):
    if dbname == 'wikidatawiki':
        modules = [
            'ext.gadget.MainLangFirst',
            'ext.wikidata-org.badges',
            'ext.wikimediaBadges',
            'jquery.wikibase.statementview.RankSelector.styles',
            'jquery.wikibase.toolbar.styles',
            'jquery.wikibase.toolbarbutton.styles',
            'wikibase.common',
        ]
        return '%7C'.join(modules) + '%7C'
    return ''
