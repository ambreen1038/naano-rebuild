-- Adds the signed-up person's name, used for the dashboard greeting
-- ("Hello Ambreen"), separate from the company name.
alter table public.profiles add column full_name text not null default '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, company_name, industry, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'industry', 'other'),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;
