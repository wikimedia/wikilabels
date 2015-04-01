CREATE TABLE campaign (
  id                   SERIAL,
  name                 VARCHAR(255),
  wiki                 VARCHAR(255),
  form                 VARCHAR(255),
  view                 VARCHAR(255),
  created              TIMESTAMP,
  labels_per_task      INT,
  tasks_per_assignment INT,
  active               BOOLEAN,
  PRIMARY KEY(id)
);



CREATE TABLE task (
  id          SERIAL,
  campaign_id INT,
  data        JSON,
  PRIMARY KEY(id),
  FOREIGN KEY(campaign_id) REFERENCES campaign(id)
);


CREATE TABLE label (
  task_id   INT,
  user_id   INT,
  timestamp TIMESTAMP,
  data      JSON,
  PRIMARY KEY(task_id, user_id)
);
CREATE INDEX label_user ON label (user_id);


CREATE TABLE workset (
  id          SERIAL,
  campaign_id INT,
  user_id     INT,
  created     TIMESTAMP,
  expires     TIMESTAMP,
  PRIMARY KEY(id)
);
CREATE INDEX workset_user ON workset (user_id);


CREATE TABLE workset_task (
  workset_id INT,
  task_id INT,
  PRIMARY KEY(workset_id, task_id),
  FOREIGN KEY(task_id) REFERENCES task(id)
);


CREATE TABLE event (
  id        SERIAL,
  type      VARCHAR(255), -- 'user_identified', 'workset_assigned', etc.
  timestamp TIMESTAMP,
  data      JSON,
  PRIMARY KEY(id)
);
CREATE INDEX event_type_timestamp ON event (type, timestamp);
