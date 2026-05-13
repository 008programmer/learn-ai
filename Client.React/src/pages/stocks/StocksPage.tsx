import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useStocksStore } from "@/stores/stocks.store";
import {
  createStockSchema,
  increaseStockSchema,
  type CreateStockFormValues,
  type IncreaseStockFormValues,
} from "@/schemas/stock.schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, Search, Loader2 } from "lucide-react";

export function StocksPage() {
  const { stocks, loading, error, fetchAll, fetchByProduct, createStock, increaseStock } =
    useStocksStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [increaseOpen, setIncreaseOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const createForm = useForm<CreateStockFormValues>({
    resolver: zodResolver(createStockSchema),
    defaultValues: { productName: "", quantity: 1 },
  });

  const increaseForm = useForm<IncreaseStockFormValues>({
    resolver: zodResolver(increaseStockSchema),
    defaultValues: { productName: "", quantity: 1 },
  });

  async function onCreate(values: CreateStockFormValues) {
    try {
      await createStock(values.productName, values.quantity);
      createForm.reset();
      setCreateOpen(false);
      void fetchAll();
    } catch {
      // error handled in store
    }
  }

  async function onIncrease(values: IncreaseStockFormValues) {
    try {
      await increaseStock(values.productName, values.quantity);
      increaseForm.reset();
      setIncreaseOpen(false);
      void fetchAll();
    } catch {
      // error handled in store
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    await fetchByProduct(search.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("stocks.title")}</h1>
        <div className="flex gap-2">
          <Dialog open={increaseOpen} onOpenChange={setIncreaseOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t("stocks.increaseStock")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("stocks.increaseTitle")}</DialogTitle>
              </DialogHeader>
              <Form {...increaseForm}>
                <form
                  onSubmit={increaseForm.handleSubmit(onIncrease)}
                  className="space-y-4"
                >
                  <FormField
                    control={increaseForm.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("stocks.productName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("stocks.productName")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={increaseForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("stocks.quantityToAdd")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={increaseForm.formState.isSubmitting}
                  >
                    {increaseForm.formState.isSubmitting
                      ? t("stocks.updating")
                      : t("stocks.increase")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("stocks.newStock")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("stocks.createTitle")}</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form
                  onSubmit={createForm.handleSubmit(onCreate)}
                  className="space-y-4"
                >
                  <FormField
                    control={createForm.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("stocks.productName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("stocks.productName")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("stocks.initialQuantity")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createForm.formState.isSubmitting}
                  >
                    {createForm.formState.isSubmitting
                      ? t("stocks.creating")
                      : t("common.create")}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder={t("stocks.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="outline" disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading")}
        </div>
      ) : stocks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("stocks.noStocks")}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("stocks.colProductName")}</TableHead>
              <TableHead>{t("stocks.colQuantity")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((s) => (
              <TableRow key={s.productName}>
                <TableCell className="font-medium">{s.productName}</TableCell>
                <TableCell>{s.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
