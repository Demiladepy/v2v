"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Users, Wifi, Coffee as CoffeeIcon } from "lucide-react";

const WORKSPACES = [
  {
    id: "ws_1",
    name: "Creator Studio",
    location: "Lennox Mall, Lekki",
    price: 15000,
    unit: "per hour",
    capacity: 2,
    status: "Available",
    image: "bg-gradient-to-br from-brand-light to-brand-dark",
  },
  {
    id: "ws_2",
    name: "Executive Meeting Room",
    location: "Yaba, Lagos",
    price: 50000,
    unit: "per day",
    capacity: 8,
    status: "Booked",
    image: "bg-gradient-to-br from-info to-info/50",
  },
];

export function CafeOneUI() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Workspace Booking</h2>
        <p className="text-sm text-muted-foreground">
          Use the Voice tab to book a room and settle via your ledger instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {WORKSPACES.map((ws) => (
          <Card
            key={ws.id}
            className="overflow-hidden bg-card/60 backdrop-blur-xl border-border shadow-sh-md group transition-all duration-300 hover:shadow-sh-lg"
          >
            {/* Mock Image Header */}
            <div className={`h-24 w-full ${ws.image} relative opacity-80 group-hover:opacity-100 transition-opacity`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-2 left-3 text-white flex items-center gap-1 text-xs font-medium">
                <MapPin className="w-3 h-3" /> {ws.location}
              </div>
            </div>
            
            <CardHeader className="pb-2 pt-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold text-foreground leading-tight">
                  {ws.name}
                </CardTitle>
                <div
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    ws.status === "Available"
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {ws.status}
                </div>
              </div>
              <CardDescription className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3" /> {ws.capacity} pax
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Wifi className="w-3 h-3" /> Fast
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <CoffeeIcon className="w-3 h-3" /> Free
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold text-brand">{formatCurrency(ws.price)}</span>
                <span className="text-xs text-muted-foreground">{ws.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
