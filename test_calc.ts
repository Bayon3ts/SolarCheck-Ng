import { calculateSolarSystem } from './src/lib/calculator/calculations';
import { CalculatorInputs } from './src/lib/calculator/types';

const inputs: CalculatorInputs = {
  ownershipStatus: "owner",
  state: "Lagos",
  lagosElectricityBand: "band_b",
  monthlyBill: 45000,
  generatorSpend: 60000,
  propertyType: "home",
  roofType: "flat_concrete",
  roofDirection: "South",
  roofPitch: "Low (10-15°)",
  coveragePct: 100,
  appliances: [
    { id: 'ac_inverter_1', qty: 1, daytimeHours: 8 }
  ],
  shadeObstruction: 10,
  panelDegradation: 0.5,
  fuelInflation: 15,
  nepaInflation: 20,
  discountRate: 22,
  fuelEfficiency: 2.0,
  systemMode: "hybrid",
  batteryType: "lithium",
  autonomyDays: 1,
};

const result = calculateSolarSystem(inputs);
console.log("batteryKwh =", result.batteryKwh);
console.log("daytimeAnalysis =", result.daytimeAnalysis);
