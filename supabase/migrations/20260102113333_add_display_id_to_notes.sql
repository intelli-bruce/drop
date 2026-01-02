-- Add display_id column (user-scoped sequential number)
alter table notes add column display_id integer;

-- Populate display_id for existing notes (ordered by created_at per user)
with numbered_notes as (
  select
    id,
    user_id,
    row_number() over (partition by user_id order by created_at) as rn
  from notes
)
update notes
set display_id = numbered_notes.rn
from numbered_notes
where notes.id = numbered_notes.id;

-- Make display_id not null after populating
alter table notes alter column display_id set not null;

-- Add unique constraint per user
alter table notes add constraint notes_user_display_id_unique unique (user_id, display_id);

-- Create function to auto-assign display_id on insert
create or replace function set_note_display_id()
returns trigger as $$
begin
  if new.display_id is null then
    select coalesce(max(display_id), 0) + 1
    into new.display_id
    from notes
    where user_id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger trigger_set_note_display_id
  before insert on notes
  for each row
  execute function set_note_display_id();

-- Add index for faster lookups
create index idx_notes_user_display_id on notes(user_id, display_id);

-- Add comment
comment on column notes.display_id is 'User-scoped sequential display ID (e.g., #1, #2, #3)';
