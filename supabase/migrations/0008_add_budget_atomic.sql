-- Fixes a real bug: the original client-side flow updated wallet_balance
-- and inserted the invoice as two separate requests, so a failure between
-- them (e.g. the invoices table not existing yet) could credit a balance
-- with no invoice to show for it. This wraps both in one Postgres function,
-- so it's a single transaction — either both happen or neither does.
create function public.add_budget(p_amount numeric)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_new_balance numeric;
begin
  if p_amount < 500 then
    raise exception 'Minimum top-up is €500';
  end if;

  update public.profiles
  set wallet_balance = wallet_balance + p_amount
  where id = auth.uid()
  returning wallet_balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'Profile not found';
  end if;

  insert into public.invoices (brand_id, kind, amount, status)
  values (auth.uid(), 'top_up', p_amount, 'paid');

  return v_new_balance;
end;
$$;

grant execute on function public.add_budget(numeric) to authenticated;
