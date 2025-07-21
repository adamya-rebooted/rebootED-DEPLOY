-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.content (
  is_complete boolean,
  created_at timestamp without time zone,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  module_id bigint NOT NULL,
  updated_at timestamp without time zone,
  body text,
  content_type character varying NOT NULL CHECK (content_type::text = ANY (ARRAY['Text'::character varying, 'Question'::character varying, 'Video'::character varying]::text[])),
  title character varying NOT NULL,
  CONSTRAINT content_pkey PRIMARY KEY (id),
  CONSTRAINT fkocp0sy1tgu9n363yvnb6xirfd FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.content_entity_impl (
  id bigint NOT NULL,
  CONSTRAINT content_entity_impl_pkey PRIMARY KEY (id),
  CONSTRAINT fk3otbuqyvq4r8ir8hwonlkvupq FOREIGN KEY (id) REFERENCES public.content(id)
);
CREATE TABLE public.course_entity_impl (
  id bigint NOT NULL,
  CONSTRAINT course_entity_impl_pkey PRIMARY KEY (id),
  CONSTRAINT fkbxtrhc37j6ucd70cd7qw57dkc FOREIGN KEY (id) REFERENCES public.courses(id)
);
CREATE TABLE public.course_students (
  course_id bigint NOT NULL,
  supabase_user_id bigint NOT NULL,
  CONSTRAINT course_students_pkey PRIMARY KEY (course_id, supabase_user_id),
  CONSTRAINT fkj5fbpmgy0y0es0gvk0311jor3 FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT fkklcy1d0dr74ueyc6igvu8dbqx FOREIGN KEY (supabase_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.course_teachers (
  course_id bigint NOT NULL,
  supabase_user_id bigint NOT NULL,
  CONSTRAINT course_teachers_pkey PRIMARY KEY (course_id, supabase_user_id),
  CONSTRAINT fk84v77efghiwpxgicxggm5rpdv FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT fklelg3t68s723scornxyr1rrug FOREIGN KEY (supabase_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.courses (
  created_at timestamp without time zone,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  updated_at timestamp without time zone,
  body text,
  title character varying NOT NULL,
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.module_entity_impl (
  id bigint NOT NULL,
  CONSTRAINT module_entity_impl_pkey PRIMARY KEY (id),
  CONSTRAINT fkqvbfr4192dciatxu442cw3c8d FOREIGN KEY (id) REFERENCES public.modules(id)
);
CREATE TABLE public.modules (
  weight double precision NOT NULL,
  course_id bigint NOT NULL,
  created_at timestamp without time zone,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  updated_at timestamp without time zone,
  body text,
  title character varying NOT NULL,
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT fk8qnnp812q1jd38fx7mxrhpw9 FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.question_info (
  id bigint NOT NULL,
  correct_answer character varying,
  CONSTRAINT question_info_pkey PRIMARY KEY (id),
  CONSTRAINT fk50ck5cklyig2k5e6mr4v9imxa FOREIGN KEY (id) REFERENCES public.content_entity_impl(id)
);
CREATE TABLE public.question_options (
  content_id bigint NOT NULL,
  option_text character varying,
  CONSTRAINT fkfbnmwd4ry5837kw84k2kuyn21 FOREIGN KEY (content_id) REFERENCES public.question_info(id)
);
CREATE TABLE public.roster_entity_impl (
  id bigint NOT NULL,
  CONSTRAINT roster_entity_impl_pkey PRIMARY KEY (id),
  CONSTRAINT fkepm999upuk557xlyhq810ghn3 FOREIGN KEY (id) REFERENCES public.rosters(id)
);
CREATE TABLE public.rosters (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  body text,
  title character varying NOT NULL,
  all_courses bytea,
  CONSTRAINT rosters_pkey PRIMARY KEY (id)
);
CREATE TABLE public.text_content_impl (
  id bigint NOT NULL,
  CONSTRAINT text_content_impl_pkey PRIMARY KEY (id),
  CONSTRAINT fk64xffdmo4jeimy6hhxp5d468n FOREIGN KEY (id) REFERENCES public.content_entity_impl(id)
);
CREATE TABLE public.user_profile_impl (
  id bigint NOT NULL,
  CONSTRAINT user_profile_impl_pkey PRIMARY KEY (id),
  CONSTRAINT fk3ud0ams86bymb2kj5ie81gwe9 FOREIGN KEY (id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  user_type smallint NOT NULL CHECK (user_type >= 0 AND user_type <= 1),
  created_at timestamp without time zone,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  updated_at timestamp without time zone,
  email character varying,
  full_name character varying,
  supabase_user_id character varying NOT NULL UNIQUE,
  username character varying NOT NULL UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.video_info (
  id bigint NOT NULL,
  video_url character varying NOT NULL,
  CONSTRAINT video_info_pkey PRIMARY KEY (id),
  CONSTRAINT fk8n4gpcjtdwl98sgydrkongjji FOREIGN KEY (id) REFERENCES public.content_entity_impl(id)
);