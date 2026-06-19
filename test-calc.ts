import { calculateSolarSystem } from './src/lib/calculator/calculations';
console.log(calculateSolarSystem({
  state: 'Lagos',
  monthlyBill: 0,
  generatorSpend: 0,
  appliances: [{ id: 'ac_1hp_inv', qty: 1 }],
  coveragePct: 100,
  systemMode: 'hybrid',
  autonomyDays: 1,
  roofType: 'corrugated_metal',
  roofDirection: 'South',
  roofPitch: 'Medium (20-30°)',
  shadeObstruction: 0,
  fuelInflation: 15,
  nepaInflation: 10,
  discountRate: 20
}));
