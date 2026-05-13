import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useCarriersStore } from "@/stores/carriers.store";
import {
  createCarrierSchema,
  type CreateCarrierFormValues,
} from "@/schemas/carrier.schemas";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

export function CarriersPage() {
  const { carriers, loading, error, fetchActive, createCarrier } =
    useCarriersStore();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    void fetchActive();
  }, [fetchActive]);

  const form = useForm<CreateCarrierFormValues>({
    resolver: zodResolver(createCarrierSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateCarrierFormValues) {
    try {
      await createCarrier(values.name);
      form.reset();
      setOpen(false);
    } catch {
      // error handled in store
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("carriers.title")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("carriers.newCarrier")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("carriers.createTitle")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("carriers.carrierName")}</FormLabel>
                      <FormControl>
                        <Input placeholder="DHL, FedEx, UPS…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? t("carriers.creating")
                    : t("common.create")}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading")}
        </div>
      ) : carriers.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("carriers.noCarriers")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("carriers.colName")}</TableHead>
              <TableHead>{t("carriers.colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carriers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "default" : "secondary"}>
                    {c.isActive ? t("carriers.active") : t("carriers.inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
