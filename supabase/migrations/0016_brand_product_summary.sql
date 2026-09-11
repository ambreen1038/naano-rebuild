-- Settings page + per-space "Product Summary" fields. Every field here is
-- plain, brand-editable data (no AI involved yet — see product_summary_status
-- below); RLS is unchanged since these all live on the existing `brands`
-- row, already scoped by "brands: members can view/update".
alter table public.brands
  add column tagline text,
  add column company_size text
    check (company_size in ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  add column product_description text,
  add column product_summary text,
  add column product_features text[] not null default '{}',
  add column product_differentiators text[] not null default '{}',
  -- 'none': never attempted. 'pending': a scan/generate call is running.
  -- 'ready': fields above hold real generated content. 'failed': the last
  -- attempt errored (see product_summary_error for why) — never a state
  -- that implies fabricated content is present.
  add column product_summary_status text not null default 'none'
    check (product_summary_status in ('none', 'pending', 'ready', 'failed')),
  add column product_summary_error text;

-- create_brand() now also takes the space's website, set at creation time
-- (Case 2: "create another space" collects it up front, same as signup).
-- Dropped and recreated rather than `create or replace`: a different
-- parameter list would otherwise create a second overload instead of
-- replacing the original.
drop function public.create_brand(text);

create function public.create_brand(p_company_name text, p_website text default null)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_brand_id uuid;
  v_name text := btrim(coalesce(p_company_name, ''));
  v_website text := nullif(btrim(coalesce(p_website, '')), '');
begin
  if v_name = '' then
    raise exception 'Space name is required';
  end if;

  insert into public.brands (company_name, website) values (v_name, v_website)
  returning id into v_brand_id;

  insert into public.brand_members (brand_id, user_id, role)
  values (v_brand_id, auth.uid(), 'owner');

  update public.profiles set active_brand_id = v_brand_id where id = auth.uid();

  return v_brand_id;
end;
$$;

grant execute on function public.create_brand(text, text) to authenticated;

-- Brand signup (Case 1) also collects a website up front now.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'brand');
  v_brand_id uuid;
begin
  if v_role = 'creator' then
    insert into public.profiles (id, role, full_name)
    values (
      new.id,
      'creator',
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    );

    insert into public.creator_onboarding (user_id, step)
    values (new.id, 2);
  else
    insert into public.brands (company_name, industry, website)
    values (
      coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data ->> 'industry', 'other'),
      nullif(btrim(coalesce(new.raw_user_meta_data ->> 'website', '')), '')
    )
    returning id into v_brand_id;

    insert into public.profiles (id, role, full_name, active_brand_id)
    values (
      new.id,
      'brand',
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      v_brand_id
    );

    insert into public.brand_members (brand_id, user_id, role)
    values (v_brand_id, new.id, 'owner');
  end if;

  return new;
end;
$$;
