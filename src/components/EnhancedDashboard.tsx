import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { CalendarDays, TrendingUp, MapPin, Activity, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SoilReading {
  id: string;
  nitrogen: number;
  ph: number;
  moisture: number;
  temperature?: number;
  plant_type?: string;
  reading_date: string;
  location: {
    id: string;
    name: string;
  };
}

interface AggregatedData {
  aggregation_type: string;
  period_start: string;
  period_end: string;
  avg_nitrogen: number;
  avg_ph: number;
  avg_moisture: number;
  avg_temperature?: number;
  min_nitrogen: number;
  max_nitrogen: number;
  min_ph: number;
  max_ph: number;
  min_moisture: number;
  max_moisture: number;
  total_readings: number;
}

interface Location {
  id: string;
  name: string;
}

interface EnhancedDashboardProps {
  selectedLocationId?: string;
}

export function EnhancedDashboard({ selectedLocationId }: EnhancedDashboardProps) {
  const [soilReadings, setSoilReadings] = useState<SoilReading[]>([]);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAggregation, setSelectedAggregation] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedLocationId, selectedAggregation, selectedLocationFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('id, name')
        .eq('user_id', user.user.id);

      setLocations(locationsData || []);

      // Build query for soil readings
      let readingsQuery = supabase
        .from('soil_readings')
        .select(`
          *,
          location:locations(id, name)
        `)
        .eq('user_id', user.user.id)
        .order('reading_date', { ascending: false });

      // Apply location filter
      if (selectedLocationId) {
        readingsQuery = readingsQuery.eq('location_id', selectedLocationId);
      } else if (selectedLocationFilter !== 'all') {
        readingsQuery = readingsQuery.eq('location_id', selectedLocationFilter);
      }

      const { data: readingsData, error: readingsError } = await readingsQuery.limit(1000);
      
      if (readingsError) throw readingsError;
      setSoilReadings(readingsData || []);

      // Trigger aggregation and fetch aggregated data
      await triggerAggregation(user.user.id, selectedAggregation);
      
      let aggregatedQuery = supabase
        .from('aggregated_data')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('aggregation_type', selectedAggregation)
        .order('period_start', { ascending: false });

      const { data: aggregatedDataResult, error: aggregatedError } = await aggregatedQuery.limit(50);
      
      if (aggregatedError) throw aggregatedError;
      setAggregatedData(aggregatedDataResult || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAggregation = async (userId: string, aggregationType: string) => {
    try {
      // Generate periods for aggregation based on type
      const now = new Date();
      const periods = [];
      
      for (let i = 0; i < 12; i++) {
        let periodStart: Date, periodEnd: Date;
        
        switch (aggregationType) {
          case 'daily':
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - i);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodStart.getDate() + 1);
            break;
          case 'weekly':
            periodStart = new Date(now);
            periodStart.setDate(now.getDate() - (i * 7));
            periodStart.setDate(periodStart.getDate() - periodStart.getDay());
            periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodStart.getDate() + 7);
            break;
          case 'monthly':
            periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            break;
          case 'yearly':
            periodStart = new Date(now.getFullYear() - i, 0, 1);
            periodEnd = new Date(now.getFullYear() - i + 1, 0, 1);
            break;
          default:
            continue;
        }
        
        periods.push({ periodStart, periodEnd });
      }

      // Call aggregation function for each period
      for (const { periodStart, periodEnd } of periods) {
        await supabase.rpc('aggregate_soil_data', {
          p_user_id: userId,
          p_aggregation_type: aggregationType,
          p_period_start: periodStart.toISOString(),
          p_period_end: periodEnd.toISOString()
        });
      }
    } catch (error) {
      console.error('Error triggering aggregation:', error);
    }
  };

  const getLatestReadings = () => {
    if (selectedLocationFilter !== 'all') {
      return soilReadings.filter(reading => reading.location.id === selectedLocationFilter).slice(0, 5);
    }
    return soilReadings.slice(0, 5);
  };

  const getAverages = () => {
    const readings = selectedLocationFilter !== 'all' 
      ? soilReadings.filter(reading => reading.location.id === selectedLocationFilter)
      : soilReadings;

    if (readings.length === 0) return { nitrogen: 0, ph: 0, moisture: 0, temperature: 0 };

    return {
      nitrogen: readings.reduce((sum, r) => sum + r.nitrogen, 0) / readings.length,
      ph: readings.reduce((sum, r) => sum + r.ph, 0) / readings.length,
      moisture: readings.reduce((sum, r) => sum + r.moisture, 0) / readings.length,
      temperature: readings.filter(r => r.temperature).reduce((sum, r) => sum + (r.temperature || 0), 0) / readings.filter(r => r.temperature).length || 0
    };
  };

  const getChartData = () => {
    return aggregatedData
      .slice(0, 12)
      .reverse()
      .map(data => ({
        period: new Date(data.period_start).toLocaleDateString(),
        nitrogen: data.avg_nitrogen,
        ph: data.avg_ph,
        moisture: data.avg_moisture,
        temperature: data.avg_temperature || 0,
        readings: data.total_readings
      }));
  };

  const detectAnomalies = () => {
    const averages = getAverages();
    const anomalies = [];

    soilReadings.slice(0, 10).forEach(reading => {
      if (Math.abs(reading.nitrogen - averages.nitrogen) > averages.nitrogen * 0.3) {
        anomalies.push(`Unusual nitrogen level at ${reading.location.name}`);
      }
      if (Math.abs(reading.ph - averages.ph) > 1.5) {
        anomalies.push(`pH anomaly detected at ${reading.location.name}`);
      }
      if (Math.abs(reading.moisture - averages.moisture) > averages.moisture * 0.4) {
        anomalies.push(`Moisture anomaly at ${reading.location.name}`);
      }
    });

    return anomalies.slice(0, 3);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const averages = getAverages();
  const chartData = getChartData();
  const anomalies = detectAnomalies();
  const latestReadings = getLatestReadings();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={selectedAggregation} onValueChange={(value: any) => setSelectedAggregation(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLocationFilter} onValueChange={setSelectedLocationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Readings</span>
            </div>
            <div className="text-2xl font-bold">{soilReadings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Locations</span>
            </div>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Avg pH</span>
            </div>
            <div className="text-2xl font-bold">{averages.ph.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg Moisture</span>
            </div>
            <div className="text-2xl font-bold">{averages.moisture.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies Alert */}
      {anomalies.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Anomalies Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {anomalies.map((anomaly, index) => (
                <li key={index} className="text-orange-700">• {anomaly}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Parameter Comparison</TabsTrigger>
          <TabsTrigger value="distribution">Data Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Soil Parameter Trends ({selectedAggregation})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nitrogen" stroke="#10b981" name="Nitrogen (mg/kg)" />
                  <Line type="monotone" dataKey="ph" stroke="#3b82f6" name="pH Level" />
                  <Line type="monotone" dataKey="moisture" stroke="#f59e0b" name="Moisture (%)" />
                  {chartData.some(d => d.temperature > 0) && (
                    <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temperature (°C)" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Comparison by Period</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nitrogen" fill="#10b981" name="Nitrogen" />
                  <Bar dataKey="ph" fill="#3b82f6" name="pH" />
                  <Bar dataKey="moisture" fill="#f59e0b" name="Moisture" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Data Distribution Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="nitrogen" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="ph" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="moisture" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestReadings.map((reading) => (
              <div key={reading.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{reading.location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reading.reading_date).toLocaleDateString()} at{' '}
                      {new Date(reading.reading_date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">N: {reading.nitrogen}</Badge>
                  <Badge variant="secondary">pH: {reading.ph}</Badge>
                  <Badge variant="secondary">M: {reading.moisture}%</Badge>
                  {reading.plant_type && (
                    <Badge variant="outline">{reading.plant_type}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}