-- Daily quotas: tag each usage row so AI reviews and speech transcriptions are counted separately.
alter table public.summary_usage add column if not exists kind text not null default 'ai';
create index if not exists summary_usage_kind_created_idx on public.summary_usage (kind, created_at desc);
