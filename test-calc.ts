import { calculateSolarSystem } from './src/lib/calculator/calculations';
console.log(calculateSolarSystem({
  state: 'Lagos',
  monthlyBill: 0,
  generatorSpend: 0,
  appliances: [{ id: 'ac_1hp_inv', qty: 1 }],
  coveragePct: 100,
  systemMode: 'hybrid',
  autonomyDays: 1,
  ownershipStatus: 'owner',
  propertyType: 'home',
  roofType: 'corrugated_iron',
  roofDirection: 'South',
  roofPitch: 'Medium (20-30°)',
  shadeObstruction: 0,
  panelDegradation: 0.006,
  fuelEfficiency: 0.3,
  batteryType: 'lithium',
  fuelInflation: 15,
  nepaInflation: 10,
  discountRate: 20
}));
