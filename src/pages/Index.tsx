
import { useState, useEffect } from "react";
import { SoilDataForm } from "@/components/SoilDataForm";
import { Dashboard } from "@/components/Dashboard";
import { WeatherWidget } from "@/components/WeatherWidget";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, BarChart3, Lightbulb, Cloud } from "lucide-react";
import { toast } from "sonner";

export interface SoilData {
  id: string;
  date: string;
  nitrogen: number;
  ph: number;
  moisture: number;
  notes?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
}

const Index = () => {
  const [soilData, setSoilData] = useState<SoilData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('soilHealthData');
    if (savedData) {
      setSoilData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever soilData changes
  useEffect(() => {
    localStorage.setItem('soilHealthData', JSON.stringify(soilData));
  }, [soilData]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Working offline - data will sync when connected");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddSoilData = (newData: Omit<SoilData, 'id' | 'date'>) => {
    const soilEntry: SoilData = {
      ...newData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    setSoilData(prev => [soilEntry, ...prev]);
    toast.success("Soil data recorded successfully!");
  };

  const getLatestSoilData = (): SoilData | null => {
    return soilData.length > 0 ? soilData[0] : null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <h1 className="text-lg font-bold">Smart Soil Monitor</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="input" className="flex flex-col gap-1 py-3">
              <Leaf className="h-4 w-4" />
              <span className="text-xs">Input</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Data</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex flex-col gap-1 py-3">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs">Tips</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex flex-col gap-1 py-3">
              <Cloud className="h-4 w-4" />
              <span className="text-xs">Weather</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <SoilDataForm onSubmit={handleAddSoilData} />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard soilData={soilData} />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsPanel latestSoilData={getLatestSoilData()} />
          </TabsContent>

          <TabsContent value="weather">
            <WeatherWidget 
              weatherData={weatherData} 
              onWeatherUpdate={setWeatherData}
              isOnline={isOnline}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
