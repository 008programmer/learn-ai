import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useShipmentsStore } from "@/stores/shipments.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ShipmentStatus } from "@/schemas/shipment.schemas";

// State machine — which actions are available per status
const allowedActions: Record<ShipmentStatus, string[]> = {
  Created: ["process", "cancel"],
  Processing: ["dispatch", "cancel"],
  Dispatched: ["transit", "cancel"],
  InTransit: ["deliver", "cancel"],
  Delivered: ["receive"],
  Received: [],
  Cancelled: [],
};

export function ShipmentDetailPage() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const { selected, loading, error, fetchByNumber, performAction } =
    useShipmentsStore();
  const { t } = useTranslation();

  const actionLabels: Record<string, string> = {
    process: t("shipments.markProcessing"),
    dispatch: t("shipments.dispatch"),
    transit: t("shipments.markInTransit"),
    deliver: t("shipments.markDelivered"),
    receive: t("shipments.markReceived"),
    cancel: t("shipments.cancelShipment"),
  };

  useEffect(() => {
    if (number) void fetchByNumber(number);
  }, [number, fetchByNumber]);

  if (loading && !selected) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!selected || selected.number !== number) {
    return <p className="text-muted-foreground">{t("shipments.notFound")}</p>;
  }

  const actions = allowedActions[selected.status] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => void navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {t("shipments.detailTitle", { number: selected.number })}
        </h1>
        <Badge>{selected.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("shipments.detailCard")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">{t("shipments.orderIdLabel")}</span>{" "}
              {selected.orderId}
            </div>
            <div>
              <span className="font-medium">{t("shipments.carrierLabel")}</span>{" "}
              {selected.carrier}
            </div>
            <div>
              <span className="font-medium">{t("shipments.receiverLabel")}</span>{" "}
              {selected.receiverEmail}
            </div>
            <div>
              <span className="font-medium">{t("shipments.addressLabel")}</span>{" "}
              {selected.address.street}, {selected.address.city},{" "}
              {selected.address.zip}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("shipments.actionsCard")}</CardTitle>
            <CardDescription>{t("shipments.availableTransitions")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {actions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("shipments.noActionsAvailable")}
              </p>
            ) : (
              actions.map((action) => (
                <Button
                  key={action}
                  variant={action === "cancel" ? "destructive" : "outline"}
                  size="sm"
                  disabled={loading}
                  onClick={() =>
                    void performAction(action, selected.number)
                  }
                >
                  {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  {actionLabels[action] ?? action}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("shipments.itemsCard")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("shipments.itemsTableProduct")}</TableHead>
                <TableHead>{t("shipments.itemsTableQty")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selected.items.map((item) => (
                <TableRow key={item.product}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
