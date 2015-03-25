CREATE TABLE user (
  id      INT,
  created TIMESTAMP,
  touched TIMESTAMP,
  PRIMARY KEY(id)
);
/*
-- Create a new user record
-- ['user', 'created'] & ['user', 'authorized']
INSERT INTO user (id, created, touched) VALUES (608542, NOW(), NOW());
*/

CREATE TABLE campaign (
  id              SERIAL,
  name            VARCHAR(255),
  form            VARCHAR(255),
  view            VARCHAR(255),
  created         TIMESTAMP,
  labels_per_task INT,
  active          BOOLEAN,
  PRIMARY KEY(id)
);
/*
-- Inserts a new campaign
-- ['campaign', 'created']
INSERT INTO campaign (name, form, view, created, labels_per_task, active)
VALUES ("Edit quality -- 2015 sample", NOW(), 2, False);

-- Gathers summary statistics and metadata for a campaign
SELECT
  campaign.name AS campaign_name,
  campaign.created AS campaign_created,
  COUNT(DISTINCT task.id) AS tasks,
  SUM(label.task_id IS NOT NONE) AS labels
FROM campaign
LEFT JOIN task ON task.campaign_id = campaign.id
LEFT JOIN label ON label.task_id = task.id
WHERE campaign.id = 345;
*/


CREATE TABLE task (
  id          SERIAL,
  campaign_id INT,
  created     TIMESTAMP,
  data        JSONB,
  PRIMARY KEY(id),
  KEY(campaign_id)
);
/*
-- Inserts a new task
-- ['campaign', 'tasks_loaded']
INSERT INTO task (campaign_id, created, data)
VALUES
  (345, NOW(), '{"rev_id": 506725001}'),
  (345, NOW(), '{"rev_id": 506725002}'),
  (345, NOW(), '{"rev_id": 506725003}'),
  (345, NOW(), '{"rev_id": 506725004}');

-- Gets all tasks and labels for a particular campaign
SELECT
  task.id AS task_id,
  task.campaign_id,
  task.data AS task_data,
  label.user_id AS label_user_id,
  label.timestamp AS label_timestamp,
  label.data AS label_data
FROM task
LEFT JOIN label ON label.task_id = task.id
WHERE task.campaign_id = 345;
*/

CREATE TABLE label (
  task_id   INT,
  user_id   INT,
  timestamp TIMESTAMP,
  data      JSONB,
  PRIMARY_KEY(task_id, user_id),
  KEY(user_id)
)
/*
-- Inserts a new label
-- ['label', 'updated']
INSERT INTO label (task_id, user_id, timestamp, data)
VALUES (12, 608542, NOW(), '{"damaging": false, "good-faith": true}');

-- Gathers the labels for a particular task
SELECT
  label.task_id,
  label.user_id,
  label.timestamp,
  label.data
FROM label
WHERE task_id = 12;
*/

CREATE TABLE workset (
  id          SERIAL,
  campaign_id INT,
  user_id     INT,
  created     TIMESTAMP,
  expires     TIMESTAMP,
  PRIMARY_KEY(id),
  KEY(user_id)
);
/*
-- Inserts a new workset (but doesn't assign tasks yet)
INSERT INTO workset (user_id, created, expires)
VALUES (608542, NOW(), NOW() + INTERVAL '1 DAY');

-- Gathers the task and label data for a workset
SELECT
  workset.id AS workset_id,
  task.id AS task_id,
  task.meta AS task_meta,
  label.data AS label_data
FROM workset
LEFT JOIN workset_task ON workset_task.workset_id = workset.id
LEFT JOIN task ON workset_task.task_id = task.id
LEFT JOIN label ON label.task_id = task.id
WHERE workset.id = 345
*/

CREATE TABLE workset_task (
  workset_id INT,
  task_id INT,
  KEY(workset_id, task_id),
  KEY(task_id)
);
/*
-- Assigns a task to a workset
INSERT INTO workset_task (workset_id, task_id)
VALUES (345, 12);

-- Assign a random sample of tasks to user's workset.  Ensures that the task
-- doesn't already have too many labels and that the task has not already been
-- labeled by the current user.
INSERT INTO workset_task
SELECT
  %(workset_id) AS workset_id
  task.id AS task_id
FROM workset
INNER JOIN campaign ON workset.campaign_id = campaign_id
INNER JOIN task ON task.campaign_id = campaign.id
LEFT JOIN label ON
  label.task_id = task.id
WHERE workset.id = %(workset_id)s
GROUP BY task.id
HAVING
  COUNT(label.task_id) < campaign.labels_per_task AND
  SUM(label.user_id = workset.user_id) = 0
ORDER BY RAND()
LIMIT 50
*/

CREATE TABLE event (
  id        SERIAL,
  timestamp TIMESTAMP,
  type      VARCHAR(255), -- 'user_identified', 'workset_assigned', etc.
  meta      JSONB,
  PRIMARY KEY(id),
  KEY(object, action, timestamp)
);
