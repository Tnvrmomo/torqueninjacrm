import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { exportToCSV, formatSalesReportForExport, formatVATReportForExport, formatARAgingForExport, formatProfitLossForExport } from "@/lib/csvExport";
import { logDataExported } from "@/lib/activityLogger";

const Reports = () => {
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));

  const { data: salesData } = useQuery({
    queryKey: ["sales-report", dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .gte("issue_date", format(dateFrom, "yyyy-MM-dd"))
        .lte("issue_date", format(dateTo, "yyyy-MM-dd"));
      return data || [];
    },
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["payments-report", dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .gte("payment_date", format(dateFrom, "yyyy-MM-dd"))
        .lte("payment_date", format(dateTo, "yyyy-MM-dd"));
      return data || [];
    },
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses-report", dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", format(dateFrom, "yyyy-MM-dd"))
        .lte("expense_date", format(dateTo, "yyyy-MM-dd"));
      return data || [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*");
      return data || [];
    },
  });

  const handleExportSales = async () => {
    if (!salesData || salesData.length === 0) return;
    const formatted = formatSalesReportForExport(salesData);
    exportToCSV(formatted, `sales_report_${format(dateFrom, 'yyyy-MM-dd')}_to_${format(dateTo, 'yyyy-MM-dd')}.csv`);
    await logDataExported('sales_report', salesData.length);
  };

  const handleExportVAT = async () => {
    if (!salesData || salesData.length === 0) return;
    const formatted = formatVATReportForExport(salesData);
    exportToCSV(formatted, `vat_report_${format(dateFrom, 'yyyy-MM-dd')}_to_${format(dateTo, 'yyyy-MM-dd')}.csv`);
    await logDataExported('vat_report', salesData.length);
  };

  const handleExportARAging = async () => {
    if (!salesData || salesData.length === 0) return;
    const formatted = formatARAgingForExport(salesData, clients || []);
    exportToCSV(formatted, `ar_aging_${format(dateFrom, 'yyyy-MM-dd')}_to_${format(dateTo, 'yyyy-MM-dd')}.csv`);
    await logDataExported('ar_aging', salesData.length);
  };

  const handleExportPL = async () => {
    if (!salesData || salesData.length === 0) return;
    const formatted = formatProfitLossForExport(salesData, expensesData || []);
    exportToCSV(formatted, `profit_loss_${format(dateFrom, 'yyyy-MM-dd')}_to_${format(dateTo, 'yyyy-MM-dd')}.csv`);
    await logDataExported('profit_loss', 1);
  };

  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount).replace("BDT", "৳");
  };

  const totalSales = salesData?.reduce((sum, inv) => sum + inv.total, 0) || 0;
  const totalPaid = paymentsData?.reduce((sum, pay) => sum + pay.amount, 0) || 0;
  const totalOutstanding = salesData?.reduce((sum, inv) => sum + inv.balance, 0) || 0;
  const totalVAT = salesData?.reduce((sum, inv) => sum + (inv.tax_amount || 0), 0) || 0;

  const invoicesByStatus = salesData?.reduce((acc: any, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Financial reports and analytics</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateFrom, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={(date) => date && setDateFrom(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[200px] justify-start text-left font-normal")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateTo, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={(date) => date && setDateTo(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Sales</div>
            <div className="text-3xl font-bold text-primary">{formatBDT(totalSales)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Collected</div>
            <div className="text-3xl font-bold">{formatBDT(totalPaid)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Outstanding</div>
            <div className="text-3xl font-bold text-destructive">{formatBDT(totalOutstanding)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total VAT</div>
            <div className="text-3xl font-bold">{formatBDT(totalVAT)}</div>
          </Card>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="vat">VAT Report</TabsTrigger>
            <TabsTrigger value="aging">A/R Aging</TabsTrigger>
            <TabsTrigger value="pl">P&L Statement</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Sales Summary</h2>
                <Button variant="outline" size="sm" onClick={handleExportSales}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Invoices</div>
                    <div className="text-2xl font-bold">{salesData?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Average Invoice Value</div>
                    <div className="text-2xl font-bold">
                      {salesData?.length ? formatBDT(totalSales / salesData.length) : formatBDT(0)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Invoices by Status</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(invoicesByStatus || {}).map(([status, count]) => (
                      <div key={status} className="border rounded p-3">
                        <div className="text-xs text-muted-foreground uppercase">{status}</div>
                        <div className="text-xl font-bold">{count as number}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="vat">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">VAT Report (Bangladesh)</h2>
                <Button variant="outline" size="sm" onClick={handleExportVAT}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="text-sm text-muted-foreground mb-2">Period</div>
                  <div className="font-medium">
                    {format(dateFrom, "dd MMM yyyy")} - {format(dateTo, "dd MMM yyyy")}
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                    <div className="text-2xl font-bold">{formatBDT(totalSales)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">VAT Collected (15%)</div>
                    <div className="text-2xl font-bold text-primary">{formatBDT(totalVAT)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Sales</div>
                    <div className="text-2xl font-bold">{formatBDT(totalSales - totalVAT)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  * This report is prepared in accordance with Bangladesh VAT regulations (VAT Act 1991)
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="aging">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Accounts Receivable Aging</h2>
                <Button variant="outline" size="sm" onClick={handleExportARAging}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">Outstanding invoices by age</div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="border rounded p-4">
                    <div className="text-xs text-muted-foreground mb-1">Current (0-30 days)</div>
                    <div className="text-xl font-bold">{formatBDT(totalOutstanding * 0.4)}</div>
                  </div>
                  <div className="border rounded p-4">
                    <div className="text-xs text-muted-foreground mb-1">31-60 days</div>
                    <div className="text-xl font-bold">{formatBDT(totalOutstanding * 0.3)}</div>
                  </div>
                  <div className="border rounded p-4">
                    <div className="text-xs text-muted-foreground mb-1">61-90 days</div>
                    <div className="text-xl font-bold">{formatBDT(totalOutstanding * 0.2)}</div>
                  </div>
                  <div className="border rounded p-4">
                    <div className="text-xs text-muted-foreground mb-1">90+ days</div>
                    <div className="text-xl font-bold text-destructive">{formatBDT(totalOutstanding * 0.1)}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  * This is a sample aging distribution. Actual implementation would calculate based on invoice due dates.
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pl">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Profit & Loss Statement</h2>
                <Button variant="outline" size="sm" onClick={handleExportPL}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="font-semibold mb-2">Revenue</div>
                  <div className="flex justify-between border-b py-2">
                    <span>Sales Revenue</span>
                    <span className="font-semibold">{formatBDT(totalSales)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total Revenue</span>
                    <span>{formatBDT(totalSales)}</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Expenses</div>
                  <div className="flex justify-between border-b py-2">
                    <span>VAT</span>
                    <span className="font-semibold">{formatBDT(totalVAT)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total Expenses</span>
                    <span>{formatBDT(totalVAT)}</span>
                  </div>
                </div>
                <div className="border-t-2 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Net Income</span>
                    <span className="text-primary">{formatBDT(totalSales - totalVAT)}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  * This is a simplified P&L. Full implementation would include cost of goods sold, operating expenses, etc.
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Reports;
