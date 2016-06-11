create table students(
	matric_no integer not null,
	password text,
	sname varchar(40) not null,
	intake varchar(10) not null,
	faculty char(10) not null,
	occupant bool,
	register bool,
	primary key (matric_no)
);
create table merits(
	id serial primary key,
	matric_no varchar(20) not null,
	event_id text not null,
	responsibility text,
	merit_point int not null,
	status integer
);
create table events(
	event_id serial primary key,
	ename text not null,
	description text not null,
	photolink text,
	status integer not null,
	location integer,
	edate date
);
create table admins(
	id serial primary key,
	aname varchar(40) not null,
	username varchar(20) not null,
	email text not null,
	password text not null
);
create table feedbacks(
	id serial primary key,
	matric_no integer,
	event_id integer,
	feedbacks text
);
create table organizers(
	id serial primary key,
	event_id integer,
	matric_no integer,
	responsibility text
);
create table locations(
	id serial primary key,
	lname text not null,
	ldescription text not null,
	latitude double precision not null,
	longitude double precision not null
);

