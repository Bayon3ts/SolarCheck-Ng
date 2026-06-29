"use client";

import { useEffect, useState } from "react";
import { getFuelPrice } from "@/lib/calculator/calculations";

export default function DynamicPriceHeader() {
  const [fuelPrice, setFuelPrice] = useState<number>(1300);

  useEffect(() => {
    getFuelPrice().then(data => {
      setFuelPrice(data.price);
    });
  }, []);

  return (
    <p className="mt-2 text-sm font-medium text-gray-500">
      Last updated: May 2026 · Fuel price: ₦{fuelPrice.toLocaleString()}/L · NERC tariff: Band A–E
    </p>
  );
}
