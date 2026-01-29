import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioSummary } from '@/components/insights/PortfolioSummary';
import { GrantsSummary } from '@/components/insights/GrantsSummary';
import { LotTracker } from '@/components/insights/LotTracker';
import { CapitalGains } from '@/components/insights/CapitalGains';
import { TaxWithholding } from '@/components/insights/TaxWithholding';
import { usePortfolio, useLots, useCapitalGains, useTaxWithholding } from '@/hooks/use-insights';
import { useGrants } from '@/hooks/use-grants';
import { useSettings } from '@/hooks/use-settings';

export function DashboardPage() {
  const { data: portfolio } = usePortfolio();
  const { data: lots } = useLots();
  const { data: capitalGains } = useCapitalGains();
  const { data: taxWithholding } = useTaxWithholding();
  const { data: grants } = useGrants();
  const { data: settings } = useSettings();

  const currency = settings?.currency ?? 'EUR';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Portfolio overview</p>
      </div>

      {portfolio && <PortfolioSummary data={portfolio} currency={currency} />}

      <Tabs defaultValue="grants">
        <TabsList>
          <TabsTrigger value="grants">Grants</TabsTrigger>
          <TabsTrigger value="lots">Tax Lots</TabsTrigger>
          <TabsTrigger value="gains">Capital Gains</TabsTrigger>
          <TabsTrigger value="tax">Tax Withholding</TabsTrigger>
        </TabsList>
        <TabsContent value="grants">
          {grants && <GrantsSummary grants={grants} currency={currency} />}
        </TabsContent>
        <TabsContent value="lots">
          {lots && <LotTracker lots={lots} currency={currency} latestPrice={portfolio?.latestPrice ?? null} />}
        </TabsContent>
        <TabsContent value="gains">
          {capitalGains && <CapitalGains sellAllocations={capitalGains} currency={currency} />}
        </TabsContent>
        <TabsContent value="tax">
          {taxWithholding && <TaxWithholding summaries={taxWithholding} currency={currency} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
