import * as Location from 'expo-location';

export type WeatherData = {
  temperature: number;
  humidity: number;
  location: string;
};

export async function getEnvironmentalData(): Promise<WeatherData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = loc.coords;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json() as {
      current: { temperature_2m: number; relative_humidity_2m: number };
    };

    // Reverse geocode to get a readable location name
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const location = [place?.city ?? place?.district, place?.region]
      .filter(Boolean)
      .join(', ');

    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      location,
    };
  } catch {
    return null;
  }
}
