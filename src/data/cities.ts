export type Destination = {city: string; area: string};

export const CITIES: Record<string, string[]> = {
  Chennai: [
    'Velachery',
    'Adyar',
    'OMR',
    'Taramani',
    'Guindy',
    'Tambaram',
    'Anna Nagar',
    'Porur',
  ],
  Bengaluru: ['Whitefield', 'Koramangala', 'HSR', 'Hebbal', 'Electronic City'],
  Mumbai: ['Andheri', 'Bandra', 'Powai', 'Thane', 'Navi Mumbai'],
  Delhi: ['Dwarka', 'Rohini', 'Saket', 'Noida', 'Gurgaon'],
};
