from wikilabels.utilities.new_campaign import main
import pytest

item = {'wiki': "cawiki", 'name': "newiki", 'form': "chan",
        'view': "bivicyt", 'labels_per_task': "1",
        'task_per_task': "50", 'active': True,
        'info_url': "https://www.mediawiki.org/wiki/ORES#Edit_quality"}

repeated = {'wiki': "cawiki", 'name': "repeated", 'form': "chan",
            'view': "bivicyt", 'labels_per_task': "1",
            'task_per_task': "50", 'active': True,
            'info_url': "https://www.mediawiki.org/wiki/ORES#Edit_quality"}


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


def test_create_campaign_fail():
    insert_repeated()
    with pytest.raises(Exception):
        insert_repeated()
