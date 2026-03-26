// ============================================================
// SHARED CONSTANTS — Power Solar CRM
// ============================================================

export const PR_MUNICIPIOS = [
  "Adjuntas","Aguada","Aguadilla","Aguas Buenas","Aibonito","Añasco","Arecibo","Arroyo",
  "Barceloneta","Barranquitas","Bayamón","Cabo Rojo","Caguas","Camuy","Canóvanas",
  "Carolina","Cataño","Cayey","Ceiba","Ciales","Cidra","Coamo","Comerío","Corozal",
  "Culebra","Dorado","Fajardo","Florida","Guánica","Guayama","Guayanilla","Guaynabo",
  "Gurabo","Hatillo","Hormigueros","Humacao","Isabela","Jayuya","Juana Díaz","Juncos",
  "Lajas","Lares","Las Marías","Las Piedras","Loíza","Luquillo","Manatí","Maricao",
  "Maunabo","Mayagüez","Moca","Morovis","Naguabo","Naranjito","Orocovis","Patillas",
  "Peñuelas","Ponce","Quebradillas","Rincón","Río Grande","Sabana Grande","Salinas",
  "San Germán","San Juan","San Lorenzo","San Sebastián","Santa Isabel","Toa Alta",
  "Toa Baja","Trujillo Alto","Utuado","Vega Alta","Vega Baja","Vieques","Villalba",
  "Yabucoa","Yauco"
];

export const LEAD_STATUS_OPTIONS = [
  "Vendido","No vendido","No pasó crédito","No le interesa","No contesta","Debe consultarlo con un familiar"
];

export const ORIGIN_OPTIONS = [
  "Google Ads","Facebook Ads","Instagram Ads","Referido","EcoFlow PR Website","Página Principal","Orgánico","Otro"
];

export const PRODUCT_TYPES = [
  "EcoFlow","Lease Solar","Lease Battery","Sistema Solar"
];

export const ECOFLOW_MODELOS = [
  "Delta 3 Plus 1024",
  "Delta 2 Max 2048",
  "Delta Pro 3600",
  "Delta Pro 3 4096",
  "Delta Pro Ultra 6kW (Portátil)",
  "Delta Pro Ultra 12kW (Portátil)",
  "Delta Pro Ultra 18kW (Portátil)",
  "Delta Pro Ultra 24kW (Portátil)",
  "Delta Pro Ultra 30kW (Portátil)",
  "River 2",
  "River 2 Max",
  "River 2 Pro"
];

export const LOAN_TYPES = [
  "Power Financial","Cash","Caribe Federal","Island Financial","United"
];

export const TRANSFER_SWITCH_OPTIONS = [
  "Transfer Switch Manual","Smart Home Panel 1","Smart Home Panel 2"
];

// Pricing data from March 2026 price list
export const ECOFLOW_PRECIOS = {
  "Delta 3 Plus 1024":         { regular: 2498, cash: 1998 },
  "Delta 2 Max 2048":          { regular: 3498, cash: 2998 },
  "Delta Pro 3600":            { regular: 5498, cash: 4998 },
  "Delta Pro 3 4096":          { regular: 6498, cash: 5998 },
  "Delta Pro Ultra 6kW (Portátil)":  { regular: 11498, cash: 10998 },
  "Delta Pro Ultra 12kW (Portátil)": { regular: 16498, cash: 15998 },
  "Delta Pro Ultra 18kW (Portátil)": { regular: 21498, cash: 20998 },
  "Delta Pro Ultra 24kW (Portátil)": { regular: 26498, cash: 25998 },
  "Delta Pro Ultra 30kW (Portátil)": { regular: 30498, cash: 29998 },
  "River 2":   { regular: 598,  cash: 598  },
  "River 2 Max": { regular: 798, cash: 798 },
  "River 2 Pro": { regular: 998, cash: 998 },
};

export const TRANSFER_PRECIOS = {
  "Transfer Switch Manual":  { regular: 500,  cash: 500,  nota: "Compatible: Delta 3 Plus, Delta 2 Max, Delta Pro, Delta Pro 3 & Delta Pro Ultra" },
  "Smart Home Panel 1":      { regular: 1998, cash: 1998, nota: "Compatible ÚNICAMENTE con Delta Pro" },
  "Smart Home Panel 2":      { regular: 2500, cash: 2500, nota: "Compatible con Delta Pro 3 y Delta Pro Ultra" },
};

export const PANELES_OPCIONES = [
  { nombre: "Panel Rígido 100W",        precio: 398  },
  { nombre: "Panel Solar 400W Flexible (EcoFlow)", precio: 998  },
  { nombre: "Flexsolar 120W",           precio: 498  },
  { nombre: "Flexsolar 240W",           precio: 698  },
  { nombre: "Flexsolar 360W",           precio: 898  },
  { nombre: "Canadian Solar 400W",      precio: null, nota: "$2.00 EPC/Watt (mínimo 5 placas)" },
];
