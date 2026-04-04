PRAGMA foreign_keys = ON;

drop table if exists user_role;
create table if not exists user_role(
    role integer primary key,
    role_desc text not null
);

insert into user_role(role, role_desc) values
    (0, "Student"),
    (1, "Instructor");

drop table if exists user;
create table if not exists user(
    user_id integer primary key AUTOINCREMENT,
    role_id integer not null,
    name text not null,
    email text not null,
    hashedPassword blob not null,
    salt blob not null,
    role integer not null,
    foreign key(role) references user_role(role)
);

drop table if exists course;
create table if not exists course(
    course_id integer primary key AUTOINCREMENT,
    course_code text not null,
    term text not null,
    prof_id integer not null,
    enabled integer not null,
    foreign key(prof_id) references user(user_id)
);

drop table if exists student_course;
create table if not exists student_course(
    user_id integer,
    course_id integer,
    average real not null,
    foreign key(user_id) references user(user_id),
    foreign key(course_id) references course(course_id),
    primary key(user_id, course_id)
);

drop table if exists assignment_type;
create table if not exists assignment_type(
    assn_type integer primary key,
    type_desc text not null
);

insert into assignment_type (assn_type, type_desc) values
    (0, "quiz"),
    (1, "lab"),
    (2, "exam"),
    (3, "assignment");

drop table if exists assignment;
create table if not exists assignment(
    assignment_id integer,
    course_id integer,
    weight real not null,
    assn_desc text not null,
    assn_type integer not null,
    due_date text not null,
    foreign key(course_id) references course(course_id),
    foreign key(assn_type) references assignment_type(assn_type),
    primary key(assignment_id, course_id)
);

drop table if exists completion_status;
create table if not exists completion_status(
    comp_status integer primary key,
    status_desc text not null
);

insert into completion_status(comp_status, status_desc) values
    (0, "Completed"),
    (1, "In Progress"),
    (2, "Missing");

drop table if exists student_assignment;
create table if not exists student_assignment(
    user_id integer,
    course_id integer,
    assignment_id integer,
    grade real not null,
    comp_status integer not null,
    foreign key(user_id, course_id) references student_course(user_id, course_id),
    foreign key(assignment_id) references assignment(assignment_id),
    foreign key(comp_status) references completion_status(comp_status),
    primary key(user_id, course_id, assignment_id) 
);