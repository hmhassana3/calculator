export interface UnitDef { id: string; name: string; symbol: string; factor?: number; }
export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  units: UnitDef[];
  convert: (value: number, from: string, to: string) => number;
}

function linearConvert(units: UnitDef[]) {
  return (value: number, from: string, to: string) => {
    const f = units.find((u) => u.id === from)!;
    const t = units.find((u) => u.id === to)!;
    return (value * f.factor!) / t.factor!;
  };
}

const lengthUnits: UnitDef[] = [
  { id: 'km', name: 'Kilometer', symbol: 'km', factor: 1000 },
  { id: 'm', name: 'Meter', symbol: 'm', factor: 1 },
  { id: 'cm', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
  { id: 'mm', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
  { id: 'um', name: 'Micrometer', symbol: 'µm', factor: 1e-6 },
  { id: 'nm', name: 'Nanometer', symbol: 'nm', factor: 1e-9 },
  { id: 'mi', name: 'Mile', symbol: 'mi', factor: 1609.344 },
  { id: 'yd', name: 'Yard', symbol: 'yd', factor: 0.9144 },
  { id: 'ft', name: 'Foot', symbol: 'ft', factor: 0.3048 },
  { id: 'in', name: 'Inch', symbol: 'in', factor: 0.0254 },
  { id: 'nmi', name: 'Nautical Mile', symbol: 'nmi', factor: 1852 },
];

const volumeUnits: UnitDef[] = [
  { id: 'l', name: 'Liter', symbol: 'L', factor: 1 },
  { id: 'ml', name: 'Milliliter', symbol: 'mL', factor: 0.001 },
  { id: 'm3', name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
  { id: 'cm3', name: 'Cubic Centimeter', symbol: 'cm³', factor: 0.001 },
  { id: 'mm3', name: 'Cubic Millimeter', symbol: 'mm³', factor: 1e-6 },
  { id: 'usgal', name: 'US Gallon', symbol: 'gal (US)', factor: 3.785411784 },
  { id: 'ukgal', name: 'UK Gallon', symbol: 'gal (UK)', factor: 4.54609 },
  { id: 'quart', name: 'Quart (US)', symbol: 'qt', factor: 0.946352946 },
  { id: 'pint', name: 'Pint (US)', symbol: 'pt', factor: 0.473176473 },
  { id: 'cup', name: 'Cup (US)', symbol: 'cup', factor: 0.2365882365 },
  { id: 'floz', name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735296 },
  { id: 'tbsp', name: 'Tablespoon', symbol: 'tbsp', factor: 0.0147867648 },
  { id: 'tsp', name: 'Teaspoon', symbol: 'tsp', factor: 0.0049289216 },
  { id: 'ft3', name: 'Cubic Foot', symbol: 'ft³', factor: 28.316846592 },
  { id: 'in3', name: 'Cubic Inch', symbol: 'in³', factor: 0.016387064 },
];

const weightUnits: UnitDef[] = [
  { id: 'kg', name: 'Kilogram', symbol: 'kg', factor: 1 },
  { id: 'g', name: 'Gram', symbol: 'g', factor: 0.001 },
  { id: 'mg', name: 'Milligram', symbol: 'mg', factor: 1e-6 },
  { id: 'ug', name: 'Microgram', symbol: 'µg', factor: 1e-9 },
  { id: 'tonne', name: 'Metric Tonne', symbol: 't', factor: 1000 },
  { id: 'lb', name: 'Pound', symbol: 'lb', factor: 0.45359237 },
  { id: 'oz', name: 'Ounce', symbol: 'oz', factor: 0.028349523125 },
  { id: 'stone', name: 'Stone', symbol: 'st', factor: 6.35029318 },
  { id: 'carat', name: 'Carat', symbol: 'ct', factor: 0.0002 },
];

const areaUnits: UnitDef[] = [
  { id: 'm2', name: 'Square Meter', symbol: 'm²', factor: 1 },
  { id: 'km2', name: 'Square Kilometer', symbol: 'km²', factor: 1e6 },
  { id: 'cm2', name: 'Square Centimeter', symbol: 'cm²', factor: 1e-4 },
  { id: 'mm2', name: 'Square Millimeter', symbol: 'mm²', factor: 1e-6 },
  { id: 'hectare', name: 'Hectare', symbol: 'ha', factor: 10000 },
  { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.8564224 },
  { id: 'mi2', name: 'Square Mile', symbol: 'mi²', factor: 2589988.110336 },
  { id: 'yd2', name: 'Square Yard', symbol: 'yd²', factor: 0.83612736 },
  { id: 'ft2', name: 'Square Foot', symbol: 'ft²', factor: 0.09290304 },
  { id: 'in2', name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
];

const speedUnits: UnitDef[] = [
  { id: 'mps', name: 'Meters/second', symbol: 'm/s', factor: 1 },
  { id: 'kph', name: 'Kilometers/hour', symbol: 'km/h', factor: 0.277777778 },
  { id: 'mph', name: 'Miles/hour', symbol: 'mph', factor: 0.44704 },
  { id: 'fps', name: 'Feet/second', symbol: 'ft/s', factor: 0.3048 },
  { id: 'knot', name: 'Knots', symbol: 'kn', factor: 0.514444444 },
  { id: 'mach', name: 'Mach', symbol: 'Ma', factor: 343 },
];

const timeUnits: UnitDef[] = [
  { id: 'ns', name: 'Nanosecond', symbol: 'ns', factor: 1e-9 },
  { id: 'us', name: 'Microsecond', symbol: 'µs', factor: 1e-6 },
  { id: 'ms', name: 'Millisecond', symbol: 'ms', factor: 0.001 },
  { id: 's', name: 'Second', symbol: 's', factor: 1 },
  { id: 'min', name: 'Minute', symbol: 'min', factor: 60 },
  { id: 'hr', name: 'Hour', symbol: 'hr', factor: 3600 },
  { id: 'day', name: 'Day', symbol: 'day', factor: 86400 },
  { id: 'week', name: 'Week', symbol: 'wk', factor: 604800 },
  { id: 'month', name: 'Month', symbol: 'mo', factor: 2629800 },
  { id: 'year', name: 'Year', symbol: 'yr', factor: 31557600 },
];

const powerUnits: UnitDef[] = [
  { id: 'w', name: 'Watt', symbol: 'W', factor: 1 },
  { id: 'kw', name: 'Kilowatt', symbol: 'kW', factor: 1000 },
  { id: 'mw', name: 'Megawatt', symbol: 'MW', factor: 1e6 },
  { id: 'hp', name: 'Horsepower', symbol: 'hp', factor: 745.699872 },
  { id: 'milliw', name: 'Milliwatt', symbol: 'mW', factor: 0.001 },
  { id: 'btuh', name: 'BTU/hour', symbol: 'BTU/h', factor: 0.29307107 },
];

const energyUnits: UnitDef[] = [
  { id: 'j', name: 'Joule', symbol: 'J', factor: 1 },
  { id: 'kj', name: 'Kilojoule', symbol: 'kJ', factor: 1000 },
  { id: 'cal', name: 'Calorie', symbol: 'cal', factor: 4.184 },
  { id: 'kcal', name: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
  { id: 'wh', name: 'Watt-hour', symbol: 'Wh', factor: 3600 },
  { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', factor: 3.6e6 },
  { id: 'ev', name: 'Electronvolt', symbol: 'eV', factor: 1.602176634e-19 },
  { id: 'btu', name: 'BTU', symbol: 'BTU', factor: 1055.05585262 },
  { id: 'therm', name: 'Therm', symbol: 'thm', factor: 105505585.262 },
];

const pressureUnits: UnitDef[] = [
  { id: 'pa', name: 'Pascal', symbol: 'Pa', factor: 1 },
  { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', factor: 1000 },
  { id: 'mpa', name: 'Megapascal', symbol: 'MPa', factor: 1e6 },
  { id: 'bar', name: 'Bar', symbol: 'bar', factor: 100000 },
  { id: 'mbar', name: 'Millibar', symbol: 'mbar', factor: 100 },
  { id: 'atm', name: 'Atmosphere', symbol: 'atm', factor: 101325 },
  { id: 'psi', name: 'PSI', symbol: 'psi', factor: 6894.757293168 },
  { id: 'torr', name: 'Torr', symbol: 'torr', factor: 133.322368421 },
  { id: 'mmhg', name: 'mmHg', symbol: 'mmHg', factor: 133.322387415 },
];

const angleUnits: UnitDef[] = [
  { id: 'deg', name: 'Degree', symbol: '°', factor: Math.PI / 180 },
  { id: 'rad', name: 'Radian', symbol: 'rad', factor: 1 },
  { id: 'grad', name: 'Gradian', symbol: 'grad', factor: Math.PI / 200 },
  { id: 'arcmin', name: 'Arcminute', symbol: "'", factor: Math.PI / (180 * 60) },
  { id: 'arcsec', name: 'Arcsecond', symbol: '"', factor: Math.PI / (180 * 3600) },
  { id: 'rev', name: 'Revolution', symbol: 'rev', factor: Math.PI * 2 },
];

const dataUnits: UnitDef[] = [
  { id: 'bit', name: 'Bit', symbol: 'b', factor: 1 },
  { id: 'byte', name: 'Byte', symbol: 'B', factor: 8 },
  { id: 'kbit', name: 'Kilobit', symbol: 'kb', factor: 1000 },
  { id: 'kbyte', name: 'Kilobyte (KB)', symbol: 'KB', factor: 8000 },
  { id: 'mbit', name: 'Megabit', symbol: 'Mb', factor: 1e6 },
  { id: 'mbyte', name: 'Megabyte (MB)', symbol: 'MB', factor: 8e6 },
  { id: 'gbit', name: 'Gigabit', symbol: 'Gb', factor: 1e9 },
  { id: 'gbyte', name: 'Gigabyte (GB)', symbol: 'GB', factor: 8e9 },
  { id: 'tbit', name: 'Terabit', symbol: 'Tb', factor: 1e12 },
  { id: 'tbyte', name: 'Terabyte (TB)', symbol: 'TB', factor: 8e12 },
  { id: 'kib', name: 'Kibibyte (KiB)', symbol: 'KiB', factor: 8 * 1024 },
  { id: 'mib', name: 'Mebibyte (MiB)', symbol: 'MiB', factor: 8 * 1024 ** 2 },
  { id: 'gib', name: 'Gibibyte (GiB)', symbol: 'GiB', factor: 8 * 1024 ** 3 },
  { id: 'tib', name: 'Tebibyte (TiB)', symbol: 'TiB', factor: 8 * 1024 ** 4 },
];

function celsiusConvert(value: number, from: string, to: string): number {
  let c: number;
  switch (from) {
    case 'c': c = value; break;
    case 'f': c = (value - 32) * (5 / 9); break;
    case 'k': c = value - 273.15; break;
    case 'r': c = (value - 491.67) * (5 / 9); break;
    default: c = value;
  }
  switch (to) {
    case 'c': return c;
    case 'f': return c * (9 / 5) + 32;
    case 'k': return c + 273.15;
    case 'r': return (c + 273.15) * (9 / 5);
    default: return c;
  }
}

const temperatureUnits: UnitDef[] = [
  { id: 'c', name: 'Celsius', symbol: '°C' },
  { id: 'f', name: 'Fahrenheit', symbol: '°F' },
  { id: 'k', name: 'Kelvin', symbol: 'K' },
  { id: 'r', name: 'Rankine', symbol: '°R' },
];

export const CATEGORIES: CategoryDef[] = [
  { id: 'length', name: 'Length', icon: 'ruler', units: lengthUnits, convert: linearConvert(lengthUnits) },
  { id: 'volume', name: 'Volume', icon: 'cup-soda', units: volumeUnits, convert: linearConvert(volumeUnits) },
  { id: 'weight', name: 'Weight & Mass', icon: 'weight', units: weightUnits, convert: linearConvert(weightUnits) },
  { id: 'temperature', name: 'Temperature', icon: 'thermometer', units: temperatureUnits, convert: celsiusConvert },
  { id: 'energy', name: 'Energy', icon: 'zap', units: energyUnits, convert: linearConvert(energyUnits) },
  { id: 'area', name: 'Area', icon: 'square', units: areaUnits, convert: linearConvert(areaUnits) },
  { id: 'speed', name: 'Speed', icon: 'gauge', units: speedUnits, convert: linearConvert(speedUnits) },
  { id: 'time', name: 'Time', icon: 'clock', units: timeUnits, convert: linearConvert(timeUnits) },
  { id: 'power', name: 'Power', icon: 'bolt', units: powerUnits, convert: linearConvert(powerUnits) },
  { id: 'data', name: 'Data Storage', icon: 'hard-drive', units: dataUnits, convert: linearConvert(dataUnits) },
  { id: 'pressure', name: 'Pressure', icon: 'gauge-circle', units: pressureUnits, convert: linearConvert(pressureUnits) },
  { id: 'angle', name: 'Angle', icon: 'triangle', units: angleUnits, convert: linearConvert(angleUnits) },
];

export function getCategory(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
