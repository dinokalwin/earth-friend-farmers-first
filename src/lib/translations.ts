export type Language = 'en' | 'ta';

export interface Translations {
  header: {
    title: string;
    online: string;
    offline: string;
  };
  tabs: {
    input: string;
    data: string;
    tips: string;
    weather: string;
  };
  soilForm: {
    title: string;
    nitrogen: string;
    ph: string;
    moisture: string;
    notes: string;
    submit: string;
    nitrogenHelper: string;
    phHelper: string;
    moistureHelper: string;
  };
  dashboard: {
    title: string;
    noData: string;
    nitrogen: string;
    ph: string;
    moisture: string;
    recentReadings: string;
  };
  recommendations: {
    title: string;
    noData: string;
    fertilizerRecommendations: string;
    cropSuggestions: string;
    general: string;
  };
  weather: {
    title: string;
    noData: string;
    temperature: string;
    humidity: string;
    getWeather: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    language: string;
  };
  messages: {
    dataRecorded: string;
    connectionRestored: string;
    workingOffline: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      title: 'Smart Soil Monitor',
      online: 'Online',
      offline: 'Offline',
    },
    tabs: {
      input: 'Input',
      data: 'Data',
      tips: 'Tips',
      weather: 'Weather',
    },
    soilForm: {
      title: 'Record Soil Data',
      nitrogen: 'Nitrogen Level',
      ph: 'pH Level',
      moisture: 'Moisture Content',
      notes: 'Notes (Optional)',
      submit: 'Record Data',
      nitrogenHelper: 'Enter nitrogen level (0-100 ppm)',
      phHelper: 'Enter pH level (0-14)',
      moistureHelper: 'Enter moisture percentage (0-100%)',
    },
    dashboard: {
      title: 'Soil Health Dashboard',
      noData: 'No soil data recorded yet. Start by adding your first measurement!',
      nitrogen: 'Nitrogen',
      ph: 'pH Level',
      moisture: 'Moisture',
      recentReadings: 'Recent Readings',
    },
    recommendations: {
      title: 'Smart Recommendations',
      noData: 'Record soil data to get personalized recommendations.',
      fertilizerRecommendations: 'Fertilizer Recommendations',
      cropSuggestions: 'Crop Suggestions',
      general: 'General Tips',
    },
    weather: {
      title: 'Weather Information',
      noData: 'Weather data unavailable in offline mode.',
      temperature: 'Temperature',
      humidity: 'Humidity',
      getWeather: 'Get Current Weather',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      language: 'Language',
    },
    messages: {
      dataRecorded: 'Soil data recorded successfully!',
      connectionRestored: 'Connection restored',
      workingOffline: 'Working offline - data will sync when connected',
    },
  },
  ta: {
    header: {
      title: 'ஸ்மார்ட் மண் கண்காணிப்பு',
      online: 'ஆன்லைன்',
      offline: 'ஆஃப்லைன்',
    },
    tabs: {
      input: 'உள்ளீடு',
      data: 'தரவு',
      tips: 'குறிப்புகள்',
      weather: 'வானிலை',
    },
    soilForm: {
      title: 'மண் தரவு பதிவு',
      nitrogen: 'நைட்ரஜன் அளவு',
      ph: 'பிஎச் அளவு',
      moisture: 'ஈரப்பதம்',
      notes: 'குறிப்புகள் (விருப்பமானது)',
      submit: 'தரவு பதிவு செய்',
      nitrogenHelper: 'நைட்ரஜன் அளவை உள்ளிடவும் (0-100 ppm)',
      phHelper: 'பிஎச் அளவை உள்ளிடவும் (0-14)',
      moistureHelper: 'ஈரப்பத சதவீதத்தை உள்ளிடவும் (0-100%)',
    },
    dashboard: {
      title: 'மண் சுகாதார டாஷ்போர்டு',
      noData: 'இன்னும் மண் தரவு பதிவு செய்யப்படவில்லை. உங்கள் முதல் அளவீட்டைச் சேர்ப்பதன் மூலம் தொடங்கவும்!',
      nitrogen: 'நைட்ரஜன்',
      ph: 'பிஎச் அளவு',
      moisture: 'ஈரப்பதம்',
      recentReadings: 'சமீபத்திய அளவீடுகள்',
    },
    recommendations: {
      title: 'ஸ்மார்ட் பரிந்துரைகள்',
      noData: 'தனிப்பயனாக்கப்பட்ட பரிந்துரைகளைப் பெற மண் தரவைப் பதிவு செய்யவும்.',
      fertilizerRecommendations: 'உர பரிந்துரைகள்',
      cropSuggestions: 'பயிர் பரிந்துரைகள்',
      general: 'பொதுவான குறிப்புகள்',
    },
    weather: {
      title: 'வானிலை தகவல்',
      noData: 'ஆஃப்லைன் பயன்முறையில் வானிலை தரவு கிடைக்கவில்லை.',
      temperature: 'வெப்பநிலை',
      humidity: 'ஈரப்பதம்',
      getWeather: 'தற்போதைய வானிலையைப் பெறுங்கள்',
    },
    common: {
      loading: 'ஏற்றுகிறது...',
      error: 'பிழை',
      success: 'வெற்றி',
      language: 'மொழி',
    },
    messages: {
      dataRecorded: 'மண் தரவு வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
      connectionRestored: 'இணைப்பு மீட்டமைக்கப்பட்டது',
      workingOffline: 'ஆஃப்லைனில் வேலை செய்கிறது - இணைக்கப்படும் போது தரவு ஒத்திசைக்கப்படும்',
    },
  },
};