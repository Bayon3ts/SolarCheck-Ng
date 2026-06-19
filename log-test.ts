import { APPLIANCES, getApplianceKwh } from './src/lib/calculator/calculations';

// @ts-ignore
const ac = APPLIANCES.find(a => a.id === 'ac_1hp_inv');
console.log('ac watts:', (ac as any)?.watts);
console.log('ac typicalHours:', (ac as any)?.typicalHours);
console.log('ac dutyCycle:', (ac as any)?.dutyCycle);
console.log('getApplianceKwh:', getApplianceKwh(ac as any, 12, 0));
console.log('dayHrs test:', Math.min((ac as any)?.typicalHours || 0, 12));
