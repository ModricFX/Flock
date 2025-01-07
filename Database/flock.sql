/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     07/01/2025 17:30:37                          */
/*==============================================================*/


drop table if exists categorizes_as;
drop table if exists chose;
drop table if exists date_option;
drop table if exists friendship;
drop table if exists invitation;
drop table if exists user_attendance;
drop table if exists tag;
drop table if exists event;
drop table if exists usernotification;
drop table if exists notification;
-- demolish the ROLE table without being stopped
SET FOREIGN_KEY_CHECKS = 0;
drop table if exists role;
SET FOREIGN_KEY_CHECKS = 1;
drop table if exists user;

/*==============================================================*/
/* Table: categorizes_as                                        */
/*==============================================================*/
create table categorizes_as
(
   id_tag               int not null,
   id_event             int not null,
   primary key (id_tag, id_event)
);

/*==============================================================*/
/* Table: chose                                                 */
/*==============================================================*/
create table chose
(
   id_date_option       int not null,
   id_user              int not null,
   primary key (id_date_option, id_user)
);

/*==============================================================*/
/* Table: date_option                                           */
/*==============================================================*/
create table date_option
(
   id_date_option       int not null auto_increment,
   id_event             int not null,
   date_start           datetime not null,
   date_end             datetime,
   primary key (id_date_option)
);

/*==============================================================*/
/* Table: event                                                 */
/*==============================================================*/
create table event
(
   id_event             int not null auto_increment,
   id_user              int not null,
   name                 varchar(64) not null,
   description          text not null,
   location             varchar(64),
   img_url              varchar(128),
   date_created         datetime not null,
   date_updated         datetime,
   end_voting_date      datetime not null,
   chosen_date_start    datetime,
   chosen_date_end      datetime,
   sysrowstate          int not null,
   primary key (id_event)
);

/*==============================================================*/
/* Table: friendship                                            */
/*==============================================================*/
create table friendship
(
   id_user              int not null,
   use_id_user          int not null,
   status               varchar(16),
   date_updated         datetime,
   primary key (id_user, use_id_user)
);
alter table friendship
MODIFY COLUMN status ENUM('pending', 'accepted', 'blocked') NOT NULL;

/*==============================================================*/
/* Table: invitation                                            */
/*==============================================================*/
create table invitation
(
   id_event             int not null,
   id_user              int not null,
   status               varchar(16) not null,
   date_invited         datetime,
   primary key (id_event, id_user)
);
alter table invitation
MODIFY COLUMN status ENUM('pending', 'accepted', 'declined') NOT NULL;

/*==============================================================*/
/* Table: notification                                          */
/*==============================================================*/
create table notification
(
   id_notification      int not null auto_increment,
   title                varchar(64) not null,
   description          text not null,
   primary key (id_notification)
);

/*==============================================================*/
/* Table: role                                                  */
/*==============================================================*/
create table role
(
   id_role              int not null auto_increment,
   name                 varchar(16) not null,
   primary key (id_role)
);

/*==============================================================*/
/* Table: tag                                                   */
/*==============================================================*/
create table tag
(
   id_tag               int not null auto_increment,
   label                varchar(32) not null,
   primary key (id_tag)
);

/*==============================================================*/
/* Table: user                                                  */
/*==============================================================*/
create table user
(
   id_user              int not null auto_increment,
   id_role              int,
   first_name           varchar(32) not null,
   last_name            varchar(32) not null,
   email                varchar(64) not null,
   password             varchar(128) not null,
   email_verified       bool,
   username             varchar(64),
   date_created         datetime,
   date_updated         datetime,
   pfp_url              varchar(128),
   sysrowstate          int not null,
   primary key (id_user)
);

/*==============================================================*/
/* Table: user_attendance                                       */
/*==============================================================*/
create table user_attendance
(
   id_event             int not null,
   id_user              int not null,
   will_attend          bool not null,
   primary key (id_event, id_user)
);

/*==============================================================*/
/* Table: usernotification                                      */
/*==============================================================*/
create table usernotification
(
   id_user              int not null,
   id_notification      int not null,
   unread               bool not null,
   date_received        datetime not null,
   primary key (id_user, id_notification)
);

alter table categorizes_as add constraint FK_categorizes_as foreign key (id_event)
      references event (id_event);

alter table categorizes_as add constraint FK_tag_of_event foreign key (id_tag)
      references tag (id_tag);

alter table chose add constraint FK_was_chosen foreign key (id_date_option)
      references date_option (id_date_option);

alter table chose add constraint FK_chose foreign key (id_user)
      references user (id_user);

alter table date_option add constraint FK_offers foreign key (id_event)
      references event (id_event) on delete cascade;

alter table event add constraint FK_created foreign key (id_user)
      references user (id_user);

alter table friendship add constraint FK_friend_initiator foreign key (use_id_user)
      references user (id_user);

alter table friendship add constraint FK_friend_recipient foreign key (id_user)
      references user (id_user);

alter table invitation add constraint FK_receives foreign key (id_user)
      references user (id_user);

alter table invitation add constraint FK_sends foreign key (id_event)
      references event (id_event);

alter table user add constraint FK_has foreign key (id_role)
      references role (id_role);

alter table user_attendance add constraint FK_records_attendance foreign key (id_user)
      references user (id_user);

alter table user_attendance add constraint FK_tracks_attendance foreign key (id_event)
      references event (id_event);

alter table usernotification add constraint FK_belongs_to foreign key (id_notification)
      references notification (id_notification);

alter table usernotification add constraint FK_receives_notification foreign key (id_user)
      references user (id_user);
