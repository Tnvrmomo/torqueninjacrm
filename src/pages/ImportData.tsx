import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Upload, Users, Package, FileText, DollarSign, Download, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { findColumnMapping, applyColumnMapping, validateMappedRow } from "@/lib/csvMapper";
import { logDataImported } from "@/lib/activityLogger";

const ImportData = () => {
  const [activeTab, setActiveTab] = useState("clients");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    Papa.parse(uploadedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreview(results.data);
      },
      error: (error) => {
        toast({
          title: "Error",
          description: `Failed to parse CSV: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('user_id', user.id)
            .single();

          if (!profile?.company_id) throw new Error('No company found');

          // Find column mappings
          const sourceColumns = Object.keys(results.data[0] || {});
          const mappings = findColumnMapping(
            sourceColumns,
            activeTab as 'invoice' | 'product' | 'quote' | 'client'
          );

          // Transform and validate rows
          const transformedRows: any[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            if (!Object.values(row).some(v => v)) return; // Skip empty rows

            const mapped = applyColumnMapping(row, mappings);
            const validation = validateMappedRow(
              mapped,
              activeTab as 'invoice' | 'product' | 'quote' | 'client'
            );

            if (validation.valid) {
              transformedRows.push({
                ...mapped,
                company_id: profile.company_id,
              });
            } else {
              errors.push(`Row ${index + 2}: ${validation.errors.join(', ')}`);
            }
          });

          if (errors.length > 0 && errors.length < results.data.length) {
            toast({
              title: "Validation Warnings",
              description: `${errors.length} rows had errors. Valid rows will be imported.`,
              variant: "default",
            });
          }

          if (transformedRows.length === 0) {
            throw new Error('No valid rows to import. Please check your CSV format.');
          }

          // Insert data
          const tableName = 
            activeTab === 'clients' ? 'clients' :
            activeTab === 'products' ? 'products' :
            activeTab === 'invoices' ? 'invoices' :
            activeTab === 'payments' ? 'payments' :
            'quotes';

          const { error } = await supabase
            .from(tableName)
            .insert(transformedRows);

          if (error) throw error;

          // Log activity
          await logDataImported(activeTab, transformedRows.length);

          toast({
            title: "Import Successful",
            description: `Successfully imported ${transformedRows.length} ${activeTab}`,
          });

          setFile(null);
          setPreview([]);
          queryClient.invalidateQueries({ queryKey: [activeTab] });
        } catch (error: any) {
          toast({
            title: "Import Failed",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      },
    });
  };

  const downloadTemplate = (type: string) => {
    const templates: Record<string, any[]> = {
      clients: [{
        'Client Name': 'Example Company Ltd',
        'Email': 'contact@example.com',
        'Phone': '+880-1700-000000',
        'Street': '123 Main Street',
        'City': 'Dhaka',
        'State/Province': 'Dhaka',
        'Postal Code': '1230',
        'Country': 'Bangladesh',
        'Status': 'active',
      }],
      products: [{
        'Product Name': 'Sample Product',
        'SKU': 'PROD-001',
        'Description': 'Product description',
        'Category': 'Stickers',
        'Cost Price': '100',
        'Sale Price': '150',
        'Stock Quantity': '50',
        'Tax Rate 1': '15',
      }],
      invoices: [{
        'Invoice Number': 'INV-0001',
        'Client Name': 'Example Company Ltd',
        'Issue Date': '2025-01-01',
        'Due Date': '2025-01-31',
        'Subtotal': '1000',
        'Tax Amount': '150',
        'Total': '1150',
        'Balance': '1150',
        'Status': 'draft',
      }],
      quotes: [{
        'Quote Number': 'QT-0001',
        'Client Name': 'Example Company Ltd',
        'Issue Date': '2025-01-01',
        'Expiry Date': '2025-02-01',
        'Subtotal': '1000',
        'Tax Amount': '150',
        'Total': '1150',
        'Status': 'draft',
      }],
      payments: [{
        'Payment Number': 'PAY-0001',
        'Client Name': 'Example Company Ltd',
        'Invoice Number': 'INV-0001',
        'Amount': '500',
        'Payment Date': '2025-01-15',
        'Payment Method': 'Bank Transfer',
        'Status': 'completed',
      }],
    };

    const csv = Papa.unparse(templates[type] || []);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
          <p className="text-muted-foreground">
            Import clients, products, invoices, quotes, or payments from CSV files
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clients">
              <Users className="mr-2 h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <FileText className="mr-2 h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="quotes">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="mr-2 h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {["clients", "products", "invoices", "quotes", "payments"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Import {tab}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(tab)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Template
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <label htmlFor={`file-${tab}`} className="cursor-pointer">
                        <span className="text-sm font-medium hover:text-primary">
                          Click to upload or drag and drop
                        </span>
                        <input
                          id={`file-${tab}`}
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      CSV files only • Intelligent column mapping included
                    </p>
                  </div>

                  {preview.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Preview (first 5 rows)</h3>
                        <p className="text-xs text-muted-foreground">
                          {file?.name} • {preview.length} rows shown
                        </p>
                      </div>
                      <div className="border rounded-lg overflow-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              {Object.keys(preview[0]).map((key) => (
                                <th key={key} className="px-4 py-2 text-left font-medium text-xs">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.map((row, i) => (
                              <tr key={i} className="border-t hover:bg-muted/50">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-4 py-2">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="w-full"
                      >
                        {isImporting ? "Importing..." : `Import ${tab}`}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ImportData;
