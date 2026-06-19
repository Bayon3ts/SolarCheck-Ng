import { calculateSolarSystem } from './src/lib/calculator/calculations';

// @ts-ignore
const res = calculateSolarSystem({
  state: 'Lagos',
  monthlyBill: 0,
  generatorSpend: 0,
  appliances: [{ id: 'ac_1hp_inv', qty: 1 }],
  coveragePct: 100,
  systemMode: 'hybrid',
  autonomyDays: 1,
  roofType: 'flat_concrete',
  roofDirection: 'South',
  roofPitch: 'Flat (0°)',
  shadeObstruction: 0,
  fuelInflation: 15,
  nepaInflation: 10,
  discountRate: 20
});

import fs from 'fs';
fs.writeFileSync('solar_results.json', JSON.stringify(res, null, 2));
