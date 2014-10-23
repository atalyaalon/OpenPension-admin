
CREATE TABLE admin_funds
(
    id integer primary key,
    managing_body varchar(128),
    managing_body_heb varchar(128),
    name varchar(128),
    url varchar(2048)
);

CREATE TABLE admin_funds_quarters
(
    id serial primary key,
    fund_id integer,
    year integer,
    quarter integer,
    status varchar(30), -- "missing", "await_vaildation", 'validated'
    user_name varchar(128),
    url varchar(2048)
);
