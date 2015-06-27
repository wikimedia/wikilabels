CREATE TABLE IF NOT EXISTS campaign (
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


CREATE TABLE IF NOT EXISTS task (
  id          SERIAL,
  campaign_id INT,
  data        JSON,
  PRIMARY KEY(id),
  FOREIGN KEY(campaign_id) REFERENCES campaign(id)
);


CREATE TABLE IF NOT EXISTS label (
  task_id   INT,
  user_id   INT,
  timestamp TIMESTAMP,
  data      JSON,
  PRIMARY KEY(task_id, user_id)
);
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN   pg_namespace n ON n.oid = c.relnamespace
      WHERE  c.relname = 'label_user'
      AND    n.nspname = 'public' -- 'public' by default
  )
  THEN CREATE INDEX label_user ON label (user_id);
END IF;
END$$;



CREATE TABLE IF NOT EXISTS workset (
  id          SERIAL,
  campaign_id INT,
  user_id     INT,
  created     TIMESTAMP,
  expires     TIMESTAMP,
  PRIMARY KEY(id)
);
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN   pg_namespace n ON n.oid = c.relnamespace
      WHERE  c.relname = 'workset_user'
      AND    n.nspname = 'public' -- 'public' by default
  )
  THEN CREATE INDEX workset_user ON workset (user_id);
END IF;
END$$;



CREATE TABLE IF NOT EXISTS workset_task (
  workset_id INT,
  task_id INT,
  PRIMARY KEY(workset_id, task_id),
  FOREIGN KEY(task_id) REFERENCES task(id)
);


CREATE TABLE IF NOT EXISTS event (
  id        SERIAL,
  type      VARCHAR(255), -- 'user_identified', 'workset_assigned', etc.
  timestamp TIMESTAMP,
  data      JSON,
  PRIMARY KEY(id)
);
DO $$
BEGIN
  IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN   pg_namespace n ON n.oid = c.relnamespace
      WHERE  c.relname = 'event_type_timestamp'
      AND    n.nspname = 'public' -- 'public' by default
  )
  THEN CREATE INDEX event_type_timestamp ON event (type, timestamp);
END IF;
END$$;
