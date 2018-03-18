from wikilabels.utilities.new_campaign import main

item = {'wiki': "cawiki", 'name': "newiki", 'form': "chan",
        'view': "bivicyt", 'labels_per_task': "1",
        'task_per_task': "50", 'active': True,
        'info_url':
            "--info-url=https://www.mediawiki.org/wiki/ORES#Edit_quality"}

repeated = {'wiki': "cawiki", 'name': "repeated", 'form': "chan",
            'view': "bivicyt", 'labels_per_task': "1",
            'task_per_task': "50", 'active': True,
            'info_url':
                "--info-url=https://www.mediawiki.org/wiki/ORES#Edit_quality"}

optional = {'wiki': "cawiki", 'name': "optional", 'form': "chan",
            'view': "bivicyt", 'labels_per_task': "1",
            'task_per_task': "50", 'active': True}


def test_create_campaign():
    main([item["wiki"], item['name'],
          item['form'], item['view'],
          item['labels_per_task'],
          item['task_per_task'],
          item['info_url']])


def insert_repeated():
    main([repeated["wiki"], repeated['name'],
          repeated['form'], repeated['view'],
          repeated['labels_per_task'],
          repeated['task_per_task'],
          repeated['info_url']])


def test_create_campaign_fail(capsys):
    insert_repeated()
    insert_repeated()
    out, err = capsys.readouterr()
    assert (err == "Duplicate campaign: repeated already exists for cawiki.  "
            "Use --force if this is expected.\n")


def test_create_campaign_optional_infourl():
    main([optional["wiki"], optional['name'],
          optional['form'], optional['view'],
          optional['labels_per_task'],
          optional['task_per_task']])
