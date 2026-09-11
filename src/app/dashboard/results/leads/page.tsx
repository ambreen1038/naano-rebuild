import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResultsTabs } from "@/components/dashboard/results/ResultsTabs";
import { CampaignFilterSelect } from "@/components/dashboard/results/CampaignFilterSelect";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("created_at", { ascending: false });

  let bookingsQuery = supabase.from("bookings").select("id");
  if (campaign) bookingsQuery = bookingsQuery.eq("campaign_id", campaign);
  const { data: bookings } = await bookingsQuery;
  const bookingIds = (bookings ?? []).map((b) => b.id);

  const { data: leads } = bookingIds.length
    ? await supabase
        .from("leads")
        .select(
          "id, person_name, company_name, commitment, source, priority, created_at"
        )
        .in("booking_id", bookingIds)
    : { data: [] as never[] };

  const people = leads ?? [];
  const companies = new Set(people.map((l) => l.company_name).filter(Boolean));
  const highPriority = people.filter((l) => l.priority === "high").length;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Results
        </h1>
        {/* Decorative — no export implemented */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
        >
          <Upload className="h-4 w-4" />
          Export ICP prospects
        </button>
      </div>
      <ResultsTabs active="leads" />

      <div className="mt-4">
        <CampaignFilterSelect
          campaigns={campaigns ?? []}
          current={campaign ?? "all"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-6 text-sm text-zinc-500">
        <span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {people.length}
          </span>{" "}
          people
        </span>
        <span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            0
          </span>{" "}
          In the ICP
        </span>
        <span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {companies.size}
          </span>{" "}
          companies
        </span>
        <span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {highPriority}
          </span>{" "}
          High Priority
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-blue-600 shadow-sm dark:bg-zinc-950">
              People {people.length}
            </span>
            <span className="px-3.5 py-1.5 text-sm font-medium text-zinc-500">
              Companies {companies.size}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search for leads"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            />
            <select className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
              <option>All priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
              <th className="px-5 py-3">Person</th>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Commitment</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-zinc-500">
                  No one is here yet; people who interact with your posts
                  arrive here.
                </td>
              </tr>
            ) : (
              people.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {l.person_name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                    {l.company_name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                    {l.commitment ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                    {l.source ?? "—"}
                  </td>
                  <td className="px-5 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                    {l.priority}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
