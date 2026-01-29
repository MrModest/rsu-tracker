import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';

const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];

export function SettingsPage() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const currentCurrency = settings?.currency ?? 'EUR';

  const handleCurrencyChange = (value: string) => {
    updateSettings.mutate({ currency: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">App configuration</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <select
              id="currency"
              value={currentCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
