import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Upload } from 'lucide-react';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { useExportData, useImportData } from '@/hooks/use-data';

const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];

export function SettingsPage() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const exportData = useExportData();
  const importData = useImportData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentCurrency = settings?.currency ?? 'EUR';

  const handleCurrencyChange = (value: string) => {
    updateSettings.mutate({ currency: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleImportConfirm = () => {
    if (!selectedFile) return;
    importData.mutate(selectedFile, {
      onSuccess: () => setSelectedFile(null),
    });
  };

  const handleImportCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">App configuration</p>
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

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Export</Label>
            <p className="text-sm text-muted-foreground">Download all data as a JSON file.</p>
            <Button
              variant="outline"
              onClick={() => exportData.mutate()}
              disabled={exportData.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportData.isPending ? 'Exporting...' : 'Export JSON'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Import</Label>
            <p className="text-sm text-muted-foreground">
              Import a JSON file to replace all existing data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
                {importData.isError && (
                  <p className="text-sm text-destructive">
                    {importData.error instanceof Error ? importData.error.message : 'Import failed'}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleImportConfirm}
                    disabled={importData.isPending}
                  >
                    {importData.isPending ? 'Importing...' : 'Confirm Import'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportCancel}
                    disabled={importData.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
