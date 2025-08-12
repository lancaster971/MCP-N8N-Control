-- N8N Database Schema
-- Generated from API analysis

-- Table: workflows
CREATE TABLE IF NOT EXISTS workflows (
  createdAt VARCHAR(255),
  updatedAt VARCHAR(255),
  id VARCHAR(255),
  name VARCHAR(255),
  active BOOLEAN,
  isArchived BOOLEAN,
  connections JSONB,
  settings JSONB,
  staticData VARCHAR(255),
  meta JSONB,
  pinData JSONB,
  versionId VARCHAR(255),
  triggerCount INTEGER
);

-- Table: executions
CREATE TABLE IF NOT EXISTS executions (
  id VARCHAR(255),
  finished BOOLEAN,
  mode VARCHAR(255),
  retryOf VARCHAR(255),
  retrySuccessId VARCHAR(255),
  status VARCHAR(255),
  createdAt VARCHAR(255),
  startedAt VARCHAR(255),
  stoppedAt VARCHAR(255),
  deletedAt VARCHAR(255),
  workflowId VARCHAR(255),
  waitTill VARCHAR(255)
);

