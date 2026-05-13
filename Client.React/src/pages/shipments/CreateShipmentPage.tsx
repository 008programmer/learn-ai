import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  createShipmentSchema,
  type CreateShipmentFormValues,
} from "@/schemas/shipment.schemas";
import { useShipmentsStore } from "@/stores/shipments.store";
import { useCarriersStore } from "@/stores/carriers.store";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export function CreateShipmentPage() {
  const navigate = useNavigate();
  const { createShipment, loading } = useShipmentsStore();
  const { carriers, fetchActive } = useCarriersStore();
  const { t } = useTranslation();

  useEffect(() => {
    void fetchActive();
  }, [fetchActive]);

  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      orderId: "",
      address: { street: "", city: "", zip: "" },
      carrier: "",
      receiverEmail: "",
      items: [{ product: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  async function onSubmit(values: CreateShipmentFormValues) {
    try {
      const shipment = await createShipment(values);
      void navigate(`/shipments/${shipment.number}`);
    } catch {
      // error handled in store
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t("shipments.createTitle")}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("shipments.orderCarrierCard")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("shipments.orderId")}</FormLabel>
                    <FormControl>
                      <Input placeholder="ORD-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("shipments.receiverEmail")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="receiver@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>{t("shipments.carrier")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("shipments.selectCarrier")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {carriers.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("shipments.deliveryAddressCard")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>{t("shipments.street")}</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>{t("shipments.city")}</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("shipments.zip")}</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("shipments.itemsCard")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product: "", quantity: 1 })}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t("shipments.addItem")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.product`}
                    render={({ field: f }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index > 0 ? "sr-only" : ""}>
                          {t("shipments.product")}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t("shipments.product")} {...f} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: f }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index > 0 ? "sr-only" : ""}>
                          {t("shipments.qty")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...f}
                            onChange={(e) =>
                              f.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading}>
            {loading ? t("shipments.creating") : t("shipments.createTitle")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
