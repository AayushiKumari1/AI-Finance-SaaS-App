import { useState } from "react";
import { endOfDay, endOfMonth, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { Loader, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLazyGenerateReportQuery } from "@/features/report/reportAPI";
import { formatCurrency } from "@/lib/format-currency";

type RangeKey = "last-30" | "this-month" | "last-month";

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "last-30", label: "Last 30 days" },
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
];

const getRange = (key: RangeKey) => {
  const now = new Date();
  switch (key) {
    case "this-month":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "last-month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    default:
      return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
  }
};

const ReportInsights = () => {
  const [range, setRange] = useState<RangeKey>("last-30");
  const [generate, { data, isFetching, isUninitialized }] =
    useLazyGenerateReportQuery();

  const handleGenerate = async () => {
    const { from, to } = getRange(range);
    try {
      // 2nd argument false = always ask the server again, never reuse an old result
      await generate(
        { from: from.toISOString(), to: to.toISOString() },
        false
      ).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate insights");
    }
  };

  const summary = data?.summary;

  return (
    <Card className="border shadow-none mb-5">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </h3>
            <p className="text-sm text-muted-foreground">
              Get a quick summary and tips based on your transactions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleGenerate} disabled={isFetching}>
              {isFetching && <Loader className="h-4 w-4 animate-spin" />}
              {isFetching ? "Generating…" : "Generate insights"}
            </Button>
          </div>
        </div>

        {isFetching && (
          <p className="text-sm text-muted-foreground">
            Analysing your transactions. This can take a few seconds.
          </p>
        )}

        {!isUninitialized && !isFetching && data && !summary && (
          <p className="text-sm text-muted-foreground">
            No transactions found for this period. Try a different range.
          </p>
        )}

        {!isFetching && summary && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Report for <span className="font-medium text-foreground">{data?.period}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Total income" value={formatCurrency(summary.income)} />
              <Stat label="Total expenses" value={formatCurrency(summary.expenses)} />
              <Stat label="Available balance" value={formatCurrency(summary.balance)} />
              <Stat label="Savings rate" value={`${summary.savingsRate}%`} />
            </div>

            {summary.topCategories.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Top spending categories</h4>
                <ul className="space-y-1 text-sm">
                  {summary.topCategories.map((c) => (
                    <li key={c.name} className="flex justify-between">
                      <span className="capitalize">{c.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(c.amount)} ({c.percent}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold">Insights</h4>
              {data?.insights && data.insights.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {data.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No insights available right now. Please try again.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default ReportInsights;