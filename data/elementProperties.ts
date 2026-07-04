/**
 * Numeric & physical properties per element (Module 3 · §3.1), for the periodic
 * table's trend/heatmap mode and detail drawer. "Data over code" — versioned
 * reference values keyed by atomic number.
 */
export interface ElementProperties {
  electronegativity: number | null; // Pauling scale
  atomicRadius: number | null;      // COVALENT radius (single-bond), in picometres (pm)
  ionizationEnergy: number | null;  // first ionization energy, in kJ/mol
  meltingPoint: number | null;      // in kelvin (K)
  boilingPoint: number | null;      // in kelvin (K)
  density: number | null;           // g/cm^3 for solids & liquids at ~room temp; null for gases
  standardState: "solid" | "liquid" | "gas" | "unknown"; // at 298 K (25 °C)
}

export const ELEMENT_PROPERTIES: Record<number, ElementProperties> = {
  1:   { electronegativity: 2.20, atomicRadius: 31,   ionizationEnergy: 1312,   meltingPoint: 13.99,   boilingPoint: 20.28,  density: null,   standardState: "gas" },     // H
  2:   { electronegativity: null, atomicRadius: 28,   ionizationEnergy: 2372.3, meltingPoint: 0.95,    boilingPoint: 4.22,   density: null,   standardState: "gas" },     // He
  3:   { electronegativity: 0.98, atomicRadius: 128,  ionizationEnergy: 520.2,  meltingPoint: 453.65,  boilingPoint: 1615,   density: 0.534,  standardState: "solid" },   // Li
  4:   { electronegativity: 1.57, atomicRadius: 96,   ionizationEnergy: 899.5,  meltingPoint: 1560,    boilingPoint: 2742,   density: 1.85,   standardState: "solid" },   // Be
  5:   { electronegativity: 2.04, atomicRadius: 84,   ionizationEnergy: 800.6,  meltingPoint: 2349,    boilingPoint: 4200,   density: 2.34,   standardState: "solid" },   // B
  6:   { electronegativity: 2.55, atomicRadius: 76,   ionizationEnergy: 1086.5, meltingPoint: 3823,    boilingPoint: 4098,   density: 2.27,   standardState: "solid" },   // C
  7:   { electronegativity: 3.04, atomicRadius: 71,   ionizationEnergy: 1402.3, meltingPoint: 63.15,   boilingPoint: 77.36,  density: null,   standardState: "gas" },     // N
  8:   { electronegativity: 3.44, atomicRadius: 66,   ionizationEnergy: 1313.9, meltingPoint: 54.36,   boilingPoint: 90.20,  density: null,   standardState: "gas" },     // O
  9:   { electronegativity: 3.98, atomicRadius: 57,   ionizationEnergy: 1681,   meltingPoint: 53.48,   boilingPoint: 85.03,  density: null,   standardState: "gas" },     // F
  10:  { electronegativity: null, atomicRadius: 58,   ionizationEnergy: 2080.7, meltingPoint: 24.56,   boilingPoint: 27.07,  density: null,   standardState: "gas" },     // Ne
  11:  { electronegativity: 0.93, atomicRadius: 166,  ionizationEnergy: 495.8,  meltingPoint: 370.95,  boilingPoint: 1156,   density: 0.971,  standardState: "solid" },   // Na
  12:  { electronegativity: 1.31, atomicRadius: 141,  ionizationEnergy: 737.7,  meltingPoint: 923,     boilingPoint: 1363,   density: 1.738,  standardState: "solid" },   // Mg
  13:  { electronegativity: 1.61, atomicRadius: 121,  ionizationEnergy: 577.5,  meltingPoint: 933.47,  boilingPoint: 2792,   density: 2.70,   standardState: "solid" },   // Al
  14:  { electronegativity: 1.90, atomicRadius: 111,  ionizationEnergy: 786.5,  meltingPoint: 1687,    boilingPoint: 3538,   density: 2.33,   standardState: "solid" },   // Si
  15:  { electronegativity: 2.19, atomicRadius: 107,  ionizationEnergy: 1011.8, meltingPoint: 317.30,  boilingPoint: 553.7,  density: 1.82,   standardState: "solid" },   // P
  16:  { electronegativity: 2.58, atomicRadius: 105,  ionizationEnergy: 999.6,  meltingPoint: 388.36,  boilingPoint: 717.8,  density: 2.07,   standardState: "solid" },   // S
  17:  { electronegativity: 3.16, atomicRadius: 102,  ionizationEnergy: 1251.2, meltingPoint: 171.6,   boilingPoint: 239.11, density: null,   standardState: "gas" },     // Cl
  18:  { electronegativity: null, atomicRadius: 106,  ionizationEnergy: 1520.6, meltingPoint: 83.80,   boilingPoint: 87.30,  density: null,   standardState: "gas" },     // Ar
  19:  { electronegativity: 0.82, atomicRadius: 203,  ionizationEnergy: 418.8,  meltingPoint: 336.53,  boilingPoint: 1032,   density: 0.862,  standardState: "solid" },   // K
  20:  { electronegativity: 1.00, atomicRadius: 176,  ionizationEnergy: 589.8,  meltingPoint: 1115,    boilingPoint: 1757,   density: 1.55,   standardState: "solid" },   // Ca
  21:  { electronegativity: 1.36, atomicRadius: 170,  ionizationEnergy: 633.1,  meltingPoint: 1814,    boilingPoint: 3109,   density: 2.99,   standardState: "solid" },   // Sc
  22:  { electronegativity: 1.54, atomicRadius: 160,  ionizationEnergy: 658.8,  meltingPoint: 1941,    boilingPoint: 3560,   density: 4.51,   standardState: "solid" },   // Ti
  23:  { electronegativity: 1.63, atomicRadius: 153,  ionizationEnergy: 650.9,  meltingPoint: 2183,    boilingPoint: 3680,   density: 6.11,   standardState: "solid" },   // V
  24:  { electronegativity: 1.66, atomicRadius: 139,  ionizationEnergy: 652.9,  meltingPoint: 2180,    boilingPoint: 2944,   density: 7.15,   standardState: "solid" },   // Cr
  25:  { electronegativity: 1.55, atomicRadius: 139,  ionizationEnergy: 717.3,  meltingPoint: 1519,    boilingPoint: 2334,   density: 7.21,   standardState: "solid" },   // Mn
  26:  { electronegativity: 1.83, atomicRadius: 132,  ionizationEnergy: 762.5,  meltingPoint: 1811,    boilingPoint: 3134,   density: 7.87,   standardState: "solid" },   // Fe
  27:  { electronegativity: 1.88, atomicRadius: 126,  ionizationEnergy: 760.4,  meltingPoint: 1768,    boilingPoint: 3200,   density: 8.90,   standardState: "solid" },   // Co
  28:  { electronegativity: 1.91, atomicRadius: 124,  ionizationEnergy: 737.1,  meltingPoint: 1728,    boilingPoint: 3186,   density: 8.91,   standardState: "solid" },   // Ni
  29:  { electronegativity: 1.90, atomicRadius: 132,  ionizationEnergy: 745.5,  meltingPoint: 1357.77, boilingPoint: 2835,   density: 8.96,   standardState: "solid" },   // Cu
  30:  { electronegativity: 1.65, atomicRadius: 122,  ionizationEnergy: 906.4,  meltingPoint: 692.68,  boilingPoint: 1180,   density: 7.14,   standardState: "solid" },   // Zn
  31:  { electronegativity: 1.81, atomicRadius: 122,  ionizationEnergy: 578.8,  meltingPoint: 302.91,  boilingPoint: 2477,   density: 5.91,   standardState: "solid" },   // Ga
  32:  { electronegativity: 2.01, atomicRadius: 120,  ionizationEnergy: 762,    meltingPoint: 1211.40, boilingPoint: 3106,   density: 5.32,   standardState: "solid" },   // Ge
  33:  { electronegativity: 2.18, atomicRadius: 119,  ionizationEnergy: 947,    meltingPoint: 1090,    boilingPoint: 887,    density: 5.73,   standardState: "solid" },   // As
  34:  { electronegativity: 2.55, atomicRadius: 120,  ionizationEnergy: 941,    meltingPoint: 494,     boilingPoint: 958,    density: 4.81,   standardState: "solid" },   // Se
  35:  { electronegativity: 2.96, atomicRadius: 120,  ionizationEnergy: 1139.9, meltingPoint: 265.8,   boilingPoint: 332.0,  density: 3.12,   standardState: "liquid" },  // Br
  36:  { electronegativity: 3.00, atomicRadius: 116,  ionizationEnergy: 1350.8, meltingPoint: 115.79,  boilingPoint: 119.93, density: null,   standardState: "gas" },     // Kr
  37:  { electronegativity: 0.82, atomicRadius: 220,  ionizationEnergy: 403.0,  meltingPoint: 312.46,  boilingPoint: 961,    density: 1.53,   standardState: "solid" },   // Rb
  38:  { electronegativity: 0.95, atomicRadius: 195,  ionizationEnergy: 549.5,  meltingPoint: 1050,    boilingPoint: 1655,   density: 2.64,   standardState: "solid" },   // Sr
  39:  { electronegativity: 1.22, atomicRadius: 190,  ionizationEnergy: 600,    meltingPoint: 1799,    boilingPoint: 3609,   density: 4.47,   standardState: "solid" },   // Y
  40:  { electronegativity: 1.33, atomicRadius: 175,  ionizationEnergy: 640.1,  meltingPoint: 2128,    boilingPoint: 4682,   density: 6.52,   standardState: "solid" },   // Zr
  41:  { electronegativity: 1.60, atomicRadius: 164,  ionizationEnergy: 652.1,  meltingPoint: 2750,    boilingPoint: 5017,   density: 8.57,   standardState: "solid" },   // Nb
  42:  { electronegativity: 2.16, atomicRadius: 154,  ionizationEnergy: 684.3,  meltingPoint: 2896,    boilingPoint: 4912,   density: 10.28,  standardState: "solid" },   // Mo
  43:  { electronegativity: 1.90, atomicRadius: 147,  ionizationEnergy: 702,    meltingPoint: 2430,    boilingPoint: 4538,   density: 11,     standardState: "solid" },   // Tc
  44:  { electronegativity: 2.20, atomicRadius: 146,  ionizationEnergy: 710.2,  meltingPoint: 2607,    boilingPoint: 4423,   density: 12.45,  standardState: "solid" },   // Ru
  45:  { electronegativity: 2.28, atomicRadius: 142,  ionizationEnergy: 719.7,  meltingPoint: 2237,    boilingPoint: 3968,   density: 12.41,  standardState: "solid" },   // Rh
  46:  { electronegativity: 2.20, atomicRadius: 139,  ionizationEnergy: 804.4,  meltingPoint: 1828.05, boilingPoint: 3236,   density: 12.02,  standardState: "solid" },   // Pd
  47:  { electronegativity: 1.93, atomicRadius: 145,  ionizationEnergy: 731.0,  meltingPoint: 1234.93, boilingPoint: 2435,   density: 10.49,  standardState: "solid" },   // Ag
  48:  { electronegativity: 1.69, atomicRadius: 144,  ionizationEnergy: 867.8,  meltingPoint: 594.22,  boilingPoint: 1040,   density: 8.65,   standardState: "solid" },   // Cd
  49:  { electronegativity: 1.78, atomicRadius: 142,  ionizationEnergy: 558.3,  meltingPoint: 429.75,  boilingPoint: 2345,   density: 7.31,   standardState: "solid" },   // In
  50:  { electronegativity: 1.96, atomicRadius: 139,  ionizationEnergy: 708.6,  meltingPoint: 505.08,  boilingPoint: 2875,   density: 7.29,   standardState: "solid" },   // Sn
  51:  { electronegativity: 2.05, atomicRadius: 139,  ionizationEnergy: 834,    meltingPoint: 903.78,  boilingPoint: 1860,   density: 6.68,   standardState: "solid" },   // Sb
  52:  { electronegativity: 2.10, atomicRadius: 138,  ionizationEnergy: 869.3,  meltingPoint: 722.66,  boilingPoint: 1261,   density: 6.24,   standardState: "solid" },   // Te
  53:  { electronegativity: 2.66, atomicRadius: 139,  ionizationEnergy: 1008.4, meltingPoint: 386.85,  boilingPoint: 457.4,  density: 4.93,   standardState: "solid" },   // I
  54:  { electronegativity: 2.60, atomicRadius: 140,  ionizationEnergy: 1170.4, meltingPoint: 161.40,  boilingPoint: 165.03, density: null,   standardState: "gas" },     // Xe
  55:  { electronegativity: 0.79, atomicRadius: 244,  ionizationEnergy: 375.7,  meltingPoint: 301.7,   boilingPoint: 944,    density: 1.93,   standardState: "solid" },   // Cs
  56:  { electronegativity: 0.89, atomicRadius: 215,  ionizationEnergy: 502.9,  meltingPoint: 1000,    boilingPoint: 2170,   density: 3.51,   standardState: "solid" },   // Ba
  57:  { electronegativity: 1.10, atomicRadius: 207,  ionizationEnergy: 538.1,  meltingPoint: 1193,    boilingPoint: 3737,   density: 6.16,   standardState: "solid" },   // La
  58:  { electronegativity: 1.12, atomicRadius: 204,  ionizationEnergy: 534.4,  meltingPoint: 1068,    boilingPoint: 3716,   density: 6.77,   standardState: "solid" },   // Ce
  59:  { electronegativity: 1.13, atomicRadius: 203,  ionizationEnergy: 527,    meltingPoint: 1208,    boilingPoint: 3793,   density: 6.77,   standardState: "solid" },   // Pr
  60:  { electronegativity: 1.14, atomicRadius: 201,  ionizationEnergy: 533.1,  meltingPoint: 1297,    boilingPoint: 3347,   density: 7.01,   standardState: "solid" },   // Nd
  61:  { electronegativity: 1.13, atomicRadius: 199,  ionizationEnergy: 540,    meltingPoint: 1315,    boilingPoint: 3273,   density: 7.26,   standardState: "solid" },   // Pm
  62:  { electronegativity: 1.17, atomicRadius: 198,  ionizationEnergy: 544.5,  meltingPoint: 1345,    boilingPoint: 2067,   density: 7.52,   standardState: "solid" },   // Sm
  63:  { electronegativity: 1.20, atomicRadius: 198,  ionizationEnergy: 547.1,  meltingPoint: 1099,    boilingPoint: 1802,   density: 5.24,   standardState: "solid" },   // Eu
  64:  { electronegativity: 1.20, atomicRadius: 196,  ionizationEnergy: 593.4,  meltingPoint: 1585,    boilingPoint: 3546,   density: 7.90,   standardState: "solid" },   // Gd
  65:  { electronegativity: 1.10, atomicRadius: 194,  ionizationEnergy: 565.8,  meltingPoint: 1629,    boilingPoint: 3503,   density: 8.23,   standardState: "solid" },   // Tb
  66:  { electronegativity: 1.22, atomicRadius: 192,  ionizationEnergy: 573.0,  meltingPoint: 1680,    boilingPoint: 2840,   density: 8.54,   standardState: "solid" },   // Dy
  67:  { electronegativity: 1.23, atomicRadius: 192,  ionizationEnergy: 581.0,  meltingPoint: 1734,    boilingPoint: 2993,   density: 8.79,   standardState: "solid" },   // Ho
  68:  { electronegativity: 1.24, atomicRadius: 189,  ionizationEnergy: 589.3,  meltingPoint: 1802,    boilingPoint: 3141,   density: 9.07,   standardState: "solid" },   // Er
  69:  { electronegativity: 1.25, atomicRadius: 190,  ionizationEnergy: 596.7,  meltingPoint: 1818,    boilingPoint: 2223,   density: 9.32,   standardState: "solid" },   // Tm
  70:  { electronegativity: 1.10, atomicRadius: 187,  ionizationEnergy: 603.4,  meltingPoint: 1097,    boilingPoint: 1469,   density: 6.90,   standardState: "solid" },   // Yb
  71:  { electronegativity: 1.27, atomicRadius: 187,  ionizationEnergy: 523.5,  meltingPoint: 1925,    boilingPoint: 3675,   density: 9.84,   standardState: "solid" },   // Lu
  72:  { electronegativity: 1.30, atomicRadius: 175,  ionizationEnergy: 658.5,  meltingPoint: 2506,    boilingPoint: 4876,   density: 13.31,  standardState: "solid" },   // Hf
  73:  { electronegativity: 1.50, atomicRadius: 170,  ionizationEnergy: 761,    meltingPoint: 3290,    boilingPoint: 5731,   density: 16.69,  standardState: "solid" },   // Ta
  74:  { electronegativity: 2.36, atomicRadius: 162,  ionizationEnergy: 770,    meltingPoint: 3695,    boilingPoint: 6203,   density: 19.25,  standardState: "solid" },   // W
  75:  { electronegativity: 1.90, atomicRadius: 151,  ionizationEnergy: 760,    meltingPoint: 3459,    boilingPoint: 5869,   density: 21.02,  standardState: "solid" },   // Re
  76:  { electronegativity: 2.20, atomicRadius: 144,  ionizationEnergy: 840,    meltingPoint: 3306,    boilingPoint: 5285,   density: 22.59,  standardState: "solid" },   // Os
  77:  { electronegativity: 2.20, atomicRadius: 141,  ionizationEnergy: 880,    meltingPoint: 2739,    boilingPoint: 4701,   density: 22.56,  standardState: "solid" },   // Ir
  78:  { electronegativity: 2.28, atomicRadius: 136,  ionizationEnergy: 870,    meltingPoint: 2041.4,  boilingPoint: 4098,   density: 21.45,  standardState: "solid" },   // Pt
  79:  { electronegativity: 2.54, atomicRadius: 136,  ionizationEnergy: 890.1,  meltingPoint: 1337.33, boilingPoint: 3129,   density: 19.30,  standardState: "solid" },   // Au
  80:  { electronegativity: 2.00, atomicRadius: 132,  ionizationEnergy: 1007.1, meltingPoint: 234.32,  boilingPoint: 629.88, density: 13.53,  standardState: "liquid" },  // Hg
  81:  { electronegativity: 1.62, atomicRadius: 145,  ionizationEnergy: 589.4,  meltingPoint: 577,     boilingPoint: 1746,   density: 11.85,  standardState: "solid" },   // Tl
  82:  { electronegativity: 2.33, atomicRadius: 146,  ionizationEnergy: 715.6,  meltingPoint: 600.61,  boilingPoint: 2022,   density: 11.34,  standardState: "solid" },   // Pb
  83:  { electronegativity: 2.02, atomicRadius: 148,  ionizationEnergy: 703,    meltingPoint: 544.55,  boilingPoint: 1837,   density: 9.78,   standardState: "solid" },   // Bi
  84:  { electronegativity: 2.00, atomicRadius: 140,  ionizationEnergy: 812.1,  meltingPoint: 527,     boilingPoint: 1235,   density: 9.20,   standardState: "solid" },   // Po
  85:  { electronegativity: 2.20, atomicRadius: 150,  ionizationEnergy: 899,    meltingPoint: 575,     boilingPoint: 610,    density: 8.92,   standardState: "solid" },   // At (density predicted)
  86:  { electronegativity: 2.20, atomicRadius: 150,  ionizationEnergy: 1037.1, meltingPoint: 202,     boilingPoint: 211.5,  density: null,   standardState: "gas" },     // Rn
  87:  { electronegativity: 0.70, atomicRadius: 260,  ionizationEnergy: 393,    meltingPoint: 281,     boilingPoint: 890,    density: 2.48,   standardState: "solid" },   // Fr (density predicted)
  88:  { electronegativity: 0.90, atomicRadius: 221,  ionizationEnergy: 509.3,  meltingPoint: 973,     boilingPoint: 2010,   density: 5.5,    standardState: "solid" },   // Ra
  89:  { electronegativity: 1.10, atomicRadius: 215,  ionizationEnergy: 499,    meltingPoint: 1323,    boilingPoint: 3471,   density: 10.07,  standardState: "solid" },   // Ac
  90:  { electronegativity: 1.30, atomicRadius: 206,  ionizationEnergy: 587,    meltingPoint: 2023,    boilingPoint: 5061,   density: 11.72,  standardState: "solid" },   // Th
  91:  { electronegativity: 1.50, atomicRadius: 200,  ionizationEnergy: 568,    meltingPoint: 1841,    boilingPoint: 4300,   density: 15.37,  standardState: "solid" },   // Pa
  92:  { electronegativity: 1.38, atomicRadius: 196,  ionizationEnergy: 597.6,  meltingPoint: 1405.3,  boilingPoint: 4404,   density: 19.05,  standardState: "solid" },   // U
  93:  { electronegativity: 1.36, atomicRadius: 190,  ionizationEnergy: 604.5,  meltingPoint: 917,     boilingPoint: 4273,   density: 20.45,  standardState: "solid" },   // Np
  94:  { electronegativity: 1.28, atomicRadius: 187,  ionizationEnergy: 584.7,  meltingPoint: 912.5,   boilingPoint: 3505,   density: 19.84,  standardState: "solid" },   // Pu
  95:  { electronegativity: 1.13, atomicRadius: 180,  ionizationEnergy: 578,    meltingPoint: 1449,    boilingPoint: 2880,   density: 12,     standardState: "solid" },   // Am
  96:  { electronegativity: 1.28, atomicRadius: 169,  ionizationEnergy: 581,    meltingPoint: 1613,    boilingPoint: 3383,   density: 13.51,  standardState: "solid" },   // Cm
  97:  { electronegativity: 1.30, atomicRadius: 168,  ionizationEnergy: 601,    meltingPoint: 1259,    boilingPoint: 2900,   density: 14.78,  standardState: "solid" },   // Bk (bp predicted)
  98:  { electronegativity: 1.30, atomicRadius: 168,  ionizationEnergy: 608,    meltingPoint: 1173,    boilingPoint: 1743,   density: 15.1,   standardState: "solid" },   // Cf (bp predicted)
  99:  { electronegativity: 1.30, atomicRadius: 165,  ionizationEnergy: 619,    meltingPoint: 1133,    boilingPoint: 1269,   density: 8.84,   standardState: "solid" },   // Es (bp, density predicted)
  100: { electronegativity: 1.30, atomicRadius: 167,  ionizationEnergy: 627,    meltingPoint: 1800,    boilingPoint: null,   density: 9.7,    standardState: "solid" },   // Fm (predicted)
  101: { electronegativity: 1.30, atomicRadius: 173,  ionizationEnergy: 635,    meltingPoint: 1100,    boilingPoint: null,   density: 10.3,   standardState: "solid" },   // Md (predicted)
  102: { electronegativity: 1.30, atomicRadius: 176,  ionizationEnergy: 642,    meltingPoint: 1100,    boilingPoint: null,   density: 9.9,    standardState: "solid" },   // No (predicted)
  103: { electronegativity: 1.30, atomicRadius: 161,  ionizationEnergy: 478.6,  meltingPoint: 1900,    boilingPoint: null,   density: 14.4,   standardState: "solid" },   // Lr (mp, density predicted)
  104: { electronegativity: null, atomicRadius: 157,  ionizationEnergy: 579.9,  meltingPoint: 2400,    boilingPoint: 5800,   density: 17,     standardState: "solid" },   // Rf (predicted)
  105: { electronegativity: null, atomicRadius: 149,  ionizationEnergy: 665.6,  meltingPoint: null,    boilingPoint: null,   density: 21.6,   standardState: "solid" },   // Db (predicted)
  106: { electronegativity: null, atomicRadius: 143,  ionizationEnergy: 757.4,  meltingPoint: null,    boilingPoint: null,   density: 23.5,   standardState: "solid" },   // Sg (predicted)
  107: { electronegativity: null, atomicRadius: 141,  ionizationEnergy: 740.5,  meltingPoint: null,    boilingPoint: null,   density: 26.5,   standardState: "solid" },   // Bh (predicted)
  108: { electronegativity: null, atomicRadius: 134,  ionizationEnergy: 733.3,  meltingPoint: null,    boilingPoint: null,   density: 28,     standardState: "solid" },   // Hs (predicted)
  109: { electronegativity: null, atomicRadius: 129,  ionizationEnergy: 799.8,  meltingPoint: null,    boilingPoint: null,   density: 27.5,   standardState: "solid" },   // Mt (predicted)
  110: { electronegativity: null, atomicRadius: 128,  ionizationEnergy: 954.9,  meltingPoint: null,    boilingPoint: null,   density: 26.5,   standardState: "solid" },   // Ds (predicted)
  111: { electronegativity: null, atomicRadius: 121,  ionizationEnergy: 1020,   meltingPoint: null,    boilingPoint: null,   density: 23,     standardState: "solid" },   // Rg (predicted)
  112: { electronegativity: null, atomicRadius: 122,  ionizationEnergy: 1154.9, meltingPoint: 283,     boilingPoint: 340,    density: 14.0,   standardState: "liquid" },  // Cn (predicted)
  113: { electronegativity: null, atomicRadius: 136,  ionizationEnergy: 704.9,  meltingPoint: 700,     boilingPoint: 1400,   density: 16,     standardState: "solid" },   // Nh (predicted)
  114: { electronegativity: null, atomicRadius: 143,  ionizationEnergy: 823.9,  meltingPoint: 284,     boilingPoint: null,   density: 11.4,   standardState: "liquid" },  // Fl (predicted)
  115: { electronegativity: null, atomicRadius: 162,  ionizationEnergy: 538.3,  meltingPoint: 700,     boilingPoint: 1400,   density: 13.5,   standardState: "solid" },   // Mc (predicted)
  116: { electronegativity: null, atomicRadius: 175,  ionizationEnergy: 663.9,  meltingPoint: 700,     boilingPoint: 1100,   density: 12.9,   standardState: "solid" },   // Lv (predicted)
  117: { electronegativity: null, atomicRadius: 165,  ionizationEnergy: 736.9,  meltingPoint: 700,     boilingPoint: 883,    density: 7.2,    standardState: "solid" },   // Ts (predicted)
  118: { electronegativity: null, atomicRadius: 157,  ionizationEnergy: 860.7,  meltingPoint: 325,     boilingPoint: 450,    density: 7.0,    standardState: "solid" },   // Og (predicted)
};
