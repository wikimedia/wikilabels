COPY campaign (id, name, wiki, form, view, info_url, labels_per_task, tasks_per_assignment, active) FROM stdin;
1	Edit Quality -- 2014 10k sample	enwiki	damaging_and_goodfaith	DiffToPrevious		1	10	t
2	Edit Type -- 2015 january sample	enwiki	edit_type	DiffToPrevious		1	10	t
3	Qualidade das edições -- Amostra de 10k revisões de 2014	ptwiki	damaging_and_goodfaith	DiffToPrevious		1	10	t
4	Draft notability	enwiki	draft_notability	PageAsOfRevision		1	10	t
5	Draft notability (raw)	enwiki	draft_notability	ParsedWikitext		1	10	t
6	Edit Quality -- 2014 10k nlwiki	nlwiki	damaging_and_goodfaith	DiffToPrevious		1	10	t
7	Edit Quality -- 2015 10k sample	enwiki	damaging_and_goodfaith	DiffToPrevious		1	10	f
\.
SELECT setval('campaign_id_seq', (SELECT max(id) FROM campaign));

COPY label (task_id, user_id, data) FROM stdin;
1	608705	{"damaging": true, "good-faith": false}
2	608705	{"damaging": false, "good-faith": true}
22	555755	{"damaging": true, "good-faith": false}
\.

COPY task (id, campaign_id, data) FROM stdin;
1	1	{"rev_id": 647263235}
2	1	{"rev_id": 647454074}
3	1	{"rev_id": 649712507}
4	1	{"rev_id": 648970723}
5	1	{"rev_id": 646862075}
6	1	{"rev_id": 646838927}
7	1	{"rev_id": 647884405}
8	1	{"rev_id": 649753552}
9	1	{"rev_id": 648359119}
10	1	{"rev_id": 647954394}
11	1	{"rev_id": 647542647}
12	1	{"rev_id": 649169018}
13	1	{"rev_id": 649520794}
14	1	{"rev_id": 647935640}
15	1	{"rev_id": 646661161}
16	1	{"rev_id": 650067396}
17	1	{"rev_id": 645990834}
18	1	{"rev_id": 647271993}
19	1	{"rev_id": 646343079}
20	1	{"rev_id": 649639740}
21	1	{"rev_id": 646575545}
22	1	{"rev_id": 646642569}
23	1	{"rev_id": 646932685}
24	1	{"rev_id": 647071350}
26	1	{"rev_id": 647310240}
25	1	{"rev_id": 649503290}
27	2	{"rev_id": 648311155}
28	2	{"rev_id": 648013119}
29	2	{"rev_id": 647403164}
30	2	{"rev_id": 645976307}
31	2	{"rev_id": 648260078}
32	2	{"rev_id": 649837201}
33	2	{"rev_id": 649022081}
34	2	{"rev_id": 646111776}
35	2	{"rev_id": 649987386}
36	2	{"rev_id": 649830900}
37	2	{"rev_id": 649599892}
38	2	{"rev_id": 649848308}
39	2	{"rev_id": 646123207}
40	2	{"rev_id": 649280114}
41	2	{"rev_id": 649383340}
42	2	{"rev_id": 647896791}
43	2	{"rev_id": 649220703}
44	2	{"rev_id": 647572491}
45	2	{"rev_id": 647373446}
46	2	{"rev_id": 646895067}
48	2	{"rev_id": 649141123}
47	2	{"rev_id": 645942299}
49	2	{"rev_id": 646854333}
50	2	{"rev_id": 645262718}
51	3	{"rev_id": 41283390}
52	3	{"rev_id": 41321279}
53	3	{"rev_id": 41270845}
54	3	{"rev_id": 41359588}
55	3	{"rev_id": 41285311}
56	3	{"rev_id": 41479809}
57	3	{"rev_id": 41446040}
58	3	{"rev_id": 41432727}
59	3	{"rev_id": 41298839}
61	3	{"rev_id": 41375919}
62	3	{"rev_id": 41373687}
63	3	{"rev_id": 41420783}
64	3	{"rev_id": 41297594}
65	3	{"rev_id": 41327425}
66	3	{"rev_id": 41448066}
67	3	{"rev_id": 41290709}
68	3	{"rev_id": 41388849}
69	3	{"rev_id": 41339555}
70	3	{"rev_id": 41278851}
71	3	{"rev_id": 41416509}
72	3	{"rev_id": 41419711}
73	3	{"rev_id": 41321136}
74	3	{"rev_id": 41500050}
75	3	{"rev_id": 41268947}
76	4	{"rev_id": 41388849}
77	4	{"rev_id": 41339555}
78	4	{"rev_id": 41278851}
79	4	{"rev_id": 41416509}
80	4	{"rev_id": 41419711}
81	4	{"rev_id": 41321136}
82	4	{"rev_id": 41500050}
83	4	{"rev_id": 41268947}
84	5	{"wikitext": "{{:WP:Sandbox}}"}
85	6	{"rev_id": 44832303}
86	6	{"rev_id": 44711434}
87	6	{"rev_id": 43712057}
88	6	{"rev_id": 44395673}
\.
SELECT setval('task_id_seq', (SELECT max(id) FROM task));

COPY workset (id, campaign_id, user_id, created, expires) FROM stdin;
1	1	608705	2018-01-18 12:23:48.663469	2020-01-19 12:23:48.663469
2	3	555755	2018-01-18 12:23:48.663469	2020-01-19 12:23:48.663469
\.
SELECT setval('workset_id_seq', (SELECT max(id) FROM workset));

COPY workset_task (workset_id, task_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
2	21
2	22
2	23
2	24
2	25
\.
