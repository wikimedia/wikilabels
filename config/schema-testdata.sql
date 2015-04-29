TRUNCATE campaign CASCADE;
INSERT INTO campaign VALUES
  (1, 'Edit Quality -- 2014 10k sample', 'enwiki',
   'damaging_and_goodfaith', 'DiffToPrevious', NOW(), 1, 2, True),
  (2, 'Edit Type -- 2015 january sample', 'enwiki',
   'edit_type', 'DiffToPrevious', NOW(), 1, 2, True),
  (3, 'Edit Quality -- 2014 10k sample', 'ptwiki',
   'damaging_and_goodfaith', 'DiffToPrevious', NOW(), 1, 2, True);


TRUNCATE task CASCADE;
INSERT INTO task VALUES
  (1, 1, '{"rev_id": 101}'),
  (2, 1, '{"rev_id": 102}'),
  (3, 1, '{"rev_id": 103}'),
  (4, 1, '{"rev_id": 104}'),
  (5, 1, '{"rev_id": 105}'),
  (6, 1, '{"rev_id": 106}'),
  (7, 1, '{"rev_id": 107}'),
  (8, 1, '{"rev_id": 108}'),
  (9, 1, '{"rev_id": 109}'),
  (10, 1, '{"rev_id": 110}'),
  (11, 1, '{"rev_id": 111}'),
  (12, 1, '{"rev_id": 112}'),
  (13, 1, '{"rev_id": 113}'),
  (14, 1, '{"rev_id": 114}'),
  (15, 1, '{"rev_id": 115}'),
  (16, 1, '{"rev_id": 116}'),
  (17, 1, '{"rev_id": 117}'),
  (18, 1, '{"rev_id": 118}'),
  (19, 1, '{"rev_id": 119}'),
  (20, 1, '{"rev_id": 120}'),
  (21, 2, '{"rev_id": 2101}'),
  (22, 2, '{"rev_id": 2102}'),
  (23, 2, '{"rev_id": 2103}'),
  (24, 2, '{"rev_id": 2104}'),
  (25, 2, '{"rev_id": 2105}'),
  (26, 2, '{"rev_id": 2106}'),
  (27, 2, '{"rev_id": 2107}'),
  (28, 2, '{"rev_id": 2108}'),
  (29, 2, '{"rev_id": 2109}'),
  (30, 2, '{"rev_id": 2110}'),
  (31, 2, '{"rev_id": 2111}'),
  (32, 2, '{"rev_id": 2112}'),
  (33, 2, '{"rev_id": 2113}'),
  (34, 2, '{"rev_id": 2114}'),
  (35, 2, '{"rev_id": 2115}'),
  (36, 2, '{"rev_id": 2116}'),
  (37, 2, '{"rev_id": 2117}'),
  (38, 2, '{"rev_id": 2118}'),
  (39, 2, '{"rev_id": 2119}'),
  (40, 2, '{"rev_id": 2120}'),
  (41, 3, '{"rev_id": 3101}'),
  (42, 3, '{"rev_id": 3102}'),
  (43, 3, '{"rev_id": 3103}'),
  (44, 3, '{"rev_id": 3104}'),
  (45, 3, '{"rev_id": 3105}'),
  (46, 3, '{"rev_id": 3106}'),
  (47, 3, '{"rev_id": 3107}'),
  (48, 3, '{"rev_id": 3108}'),
  (49, 3, '{"rev_id": 3109}'),
  (50, 3, '{"rev_id": 3110}'),
  (51, 3, '{"rev_id": 3111}'),
  (52, 3, '{"rev_id": 3112}'),
  (53, 3, '{"rev_id": 3113}'),
  (54, 3, '{"rev_id": 3114}'),
  (55, 3, '{"rev_id": 3115}'),
  (56, 3, '{"rev_id": 3116}'),
  (57, 3, '{"rev_id": 3117}'),
  (58, 3, '{"rev_id": 3118}'),
  (59, 3, '{"rev_id": 3119}'),
  (60, 3, '{"rev_id": 3120}');

TRUNCATE workset;
INSERT INTO workset VALUES
  (1, 1, 608705, NOW(), NOW() + INTERVAL '1 DAY'),
  (2, 3, 555755, NOW(), NOW() + INTERVAL '1 DAY');

TRUNCATE workset_task;
INSERT INTO workset_task VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (2, 21), (2, 22), (2, 23), (2, 24), (2, 25);

TRUNCATE label;
INSERT INTO label VALUES
  (1, 608705, NOW(), '{"damaging": true, "good-faith": false}'),
  (2, 608705, NOW(), '{"damaging": false, "good-faith": true}'),
  (22, 555755, NOW(), '{"damaging": true, "good-faith": false}');
