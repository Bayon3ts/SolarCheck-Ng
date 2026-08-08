import { WorkflowStep, InstallerProfile } from "@/types/installer";

export const MOCK_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "step-1",
    title: "On-Site Audit & Panel Inspection",
    description: "Detailed roof measurement, shading analysis, and electrical panel inspection by our certified engineers."
  },
  {
    id: "step-2",
    title: "3D CAD System Design",
    description: "Custom system architecture matching your energy consumption profile and roof dimensions."
  },
  {
    id: "step-3",
    title: "Municipal Permitting & Grid Filings",
    description: "We handle all paperwork for local municipal approvals and grid interconnection applications."
  },
  {
    id: "step-4",
    title: "Structural Mounting & Racking Prep",
    description: "Installation of leak-proof roof mounts and structural racking to secure the system."
  },
  {
    id: "step-5",
    title: "Solar Panel & Inverter Installation",
    description: "Mounting the solar array, wiring the inverters, and ensuring optimal tilt and orientation."
  },
  {
    id: "step-6",
    title: "Battery Backup Wiring",
    description: "Safe integration of lithium-ion battery storage and transfer switches for blackout protection."
  },
  {
    id: "step-7",
    title: "Municipal Building Inspection",
    description: "Final safety inspection by municipal authorities to certify building code compliance."
  },
  {
    id: "step-8",
    title: "Grid Interconnection & PTO Handover",
    description: "Permission to Operate (PTO) granted. System powered on with monitoring app setup and final handover."
  }
];

// Helper to fill in missing Tripadvisor-style fields
export function enrichInstallerWithMockData(installer: any): InstallerProfile {
  return {
    ...installer,
    tagline: installer.tagline || "Premium Residential & Commercial Solar Solutions",
    demand_badge: installer.demand_badge || "🔥 Very popular! 12+ installations booked this week.",
    starting_price: installer.starting_price || 950, // Mock price in local currency/watt
    warranties: installer.warranties || {
      workmanship: "10 Years",
      roof_leak: "5 Years",
      equipment: "25 Years (Panels) / 10 Years (Inverter)"
    },
    supported_languages: installer.supported_languages || ["English", "Yoruba", "Pidgin"],
    featured_testimonial: installer.featured_testimonial || "They transformed our energy bills completely. The installation was incredibly neat, and their after-sales support is unmatched.",
    recommendation_percentage: installer.recommendation_percentage || 98
  };
}
