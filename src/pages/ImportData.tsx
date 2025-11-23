import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Upload, Users, Package, FileText, DollarSign } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
          const { data: profile } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
            .single();

          const records = results.data
            .filter((row: any) => Object.values(row).some(v => v))
            .map((row: any) => ({
              ...row,
              company_id: profile?.company_id,
            }));

          let error;
          switch (activeTab) {
            case "clients":
              ({ error } = await supabase.from("clients").insert(records));
              break;
            case "products":
              ({ error } = await supabase.from("products").insert(records));
              break;
            case "invoices":
              ({ error } = await supabase.from("invoices").insert(records));
              break;
            case "payments":
              ({ error } = await supabase.from("payments").insert(records));
              break;
          }

          if (error) throw error;

          toast({
            title: "Success",
            description: `Imported ${records.length} ${activeTab}`,
          });

          queryClient.invalidateQueries({ queryKey: [activeTab] });
          setFile(null);
          setPreview([]);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      },
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
          <p className="text-muted-foreground">
            Import clients, products, invoices, or payments from CSV files
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="payments">
              <DollarSign className="mr-2 h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {["clients", "products", "invoices", "payments"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <label htmlFor={`file-${tab}`} className="cursor-pointer">
                        <span className="text-sm font-medium">
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
                      CSV files only
                    </p>
                  </div>

                  {preview.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Preview (first 5 rows)</h3>
                      <div className="border rounded-lg overflow-auto max-h-64">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(preview[0]).map((key) => (
                                <th key={key} className="px-4 py-2 text-left font-medium">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.map((row, i) => (
                              <tr key={i} className="border-t">
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
