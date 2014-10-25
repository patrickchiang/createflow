DROP DATABASE IF EXISTS createflow;

CREATE DATABASE createflow;

USE createflow;

CREATE TABLE users
(
user_id int NOT NULL AUTO_INCREMENT,
first_name varchar(32) NOT NULL,
last_name varchar(32) NOT NULL,
email varchar(128) NOT NULL,
password varchar(128) NOT NULL,
user_type varchar(128),
status_message varchar(512),
status_endtime datetime,
PRIMARY KEY (user_id),
CONSTRAINT unique_users UNIQUE (email),
CONSTRAINT unique_name UNIQUE (first_name, last_name)
);

CREATE TABLE groups
(
group_id int NOT NULL AUTO_INCREMENT,
group_name varchar(64) NOT NULL,
group_owner_id int NOT NULL,
archived boolean,
PRIMARY KEY (group_id),
FOREIGN KEY (group_owner_id) REFERENCES users(user_id)
);

CREATE TABLE users_groups
(
user_id int NOT NULL,
group_id int NOT NULL,
archived boolean,
PRIMARY KEY (user_id, group_id),
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

CREATE TABLE chats
(
chat_id int NOT NULL,
PRIMARY KEY (chat_id)
);

CREATE TABLE messages
(
message_id int NOT NULL,
chat_id int NOT NULL,
author_user_id int NOT NULL,
message_text varchar(512),
PRIMARY KEY (message_id),
FOREIGN KEY (chat_id) REFERENCES chats(chat_id),
FOREIGN KEY (author_user_id) REFERENCES users(user_id)
);

CREATE TABLE projects
(
project_id int NOT NULL AUTO_INCREMENT,
group_id int NOT NULL,
project_name varchar(64) NOT NULL,
chat_id int,
archived boolean,
PRIMARY KEY (project_id),
FOREIGN KEY (group_id) REFERENCES groups(group_id),
FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

CREATE TABLE users_projects
(
user_id int NOT NULL,
project_id int NOT NULL,
archived boolean,
PRIMARY KEY (user_id, project_id),
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE tasks
(
task_id int NOT NULL AUTO_INCREMENT,
project_id int NOT NULL,
task_name varchar(64) NOT NULL,
chat_id int,
archived boolean,
PRIMARY KEY (task_id),
FOREIGN KEY (project_id) REFERENCES projects(project_id),
FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

CREATE TABLE users_tasks
(
user_id int NOT NULL,
task_id int NOT NULL,
archived boolean,
PRIMARY KEY (user_id, task_id),
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

INSERT INTO users (first_name, last_name, email, password, user_type)
VALUES ('Patrick','Chiang','pchiang@uw.edu','$2a$10$pwzpgYsQX2AwcH0djEqbuuHG6o1ZSSJojUg8skqBRnW/FApzNw/ay','admin'),
('Patrick','Tester','pchiang@gmail.com','$2a$10$pwzpgYsQX2AwcH0djEqbuuHG6o1ZSSJojUg8skqBRnW/FApzNw/ay','admin');

INSERT INTO groups (group_name, group_owner_id) VALUES ('Admin Group', 1);
INSERT INTO users_groups (user_id, group_id) VALUES (1, 1);