import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useShipmentsStore } from "@/stores/shipments.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import type { ShipmentStatus } from "@/schemas/shipment.schemas";

const statusVariant: Record<
  ShipmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Created: "outline",
  Processing: "secondary",
  Dispatched: "default",
  InTransit: "default",
  Delivered: "secondary",
  Received: "secondary",
  Cancelled: "destructive",
};

export function ShipmentsPage() {
  const { shipments, loading, fetchByNumber } = useShipmentsStore();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    await fetchByNumber(search.trim());
    void navigate(`/shipments/${search.trim()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("shipments.title")}</h1>
        <Button asChild>
          <Link to="/shipments/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("shipments.newShipment")}
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder={t("shipments.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="outline" disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {shipments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("shipments.colNumber")}</TableHead>
              <TableHead>{t("shipments.colOrderId")}</TableHead>
              <TableHead>{t("shipments.colCarrier")}</TableHead>
              <TableHead>{t("shipments.colStatus")}</TableHead>
              <TableHead>{t("shipments.colReceiver")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((s) => (
              <TableRow
                key={s.number}
                className="cursor-pointer"
                onClick={() => void navigate(`/shipments/${s.number}`)}
              >
                <TableCell className="font-mono text-xs">{s.number}</TableCell>
                <TableCell>{s.orderId}</TableCell>
                <TableCell>{s.carrier}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                </TableCell>
                <TableCell>{s.receiverEmail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground text-sm">
          {t("shipments.noShipments")}
        </p>
      )}
    </div>
  );
}
