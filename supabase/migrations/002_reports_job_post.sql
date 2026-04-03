-- Store original job post / brief alongside analysis result for UI display.

alter table public.reports
  add column if not exists job_post text;

comment on column public.reports.job_post is 'Original job_post (or brief) text saved with the report for display on the client.';
