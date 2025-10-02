import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, Droplets, Leaf, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationReading {
  nitrogen: string;
  ph: string;
  moisture: string;
  temperature: string;
  plant_type: string;
}

interface EnhancedSoilDataFormProps {
  onDataAdded: () => void;
}

export function EnhancedSoilDataForm({ onDataAdded }: EnhancedSoilDataFormProps) {
  const [numLocations, setNumLocations] = useState(3);
  const [readings, setReadings] = useState<LocationReading[]>(
    Array(3).fill(null).map(() => ({
      nitrogen: "",
      ph: "",
      moisture: "",
      temperature: "",
      plant_type: ""
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNumLocationsChange = (value: string) => {
    const num = parseInt(value) || 3;
    const clampedNum = Math.max(1, Math.min(10, num));
    setNumLocations(clampedNum);
    
    const newReadings = Array(clampedNum).fill(null).map((_, idx) => 
      readings[idx] || {
        nitrogen: "",
        ph: "",
        moisture: "",
        temperature: "",
        plant_type: ""
      }
    );
    setReadings(newReadings);
  };

  const updateReading = (index: number, field: keyof LocationReading, value: string) => {
    const newReadings = [...readings];
    newReadings[index] = { ...newReadings[index], [field]: value };
    setReadings(newReadings);
  };

  const calculateAverage = (values: number[]) => {
    const validValues = values.filter(v => !isNaN(v) && v !== null);
    if (validValues.length === 0) return 0;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to submit data");
        return;
      }

      // Validate that at least one reading is complete
      const validReadings = readings.filter(r => 
        r.nitrogen && r.ph && r.moisture
      );

      if (validReadings.length === 0) {
        toast.error("Please fill in at least one complete reading (nitrogen, pH, moisture)");
        return;
      }

      // Create a batch location for this reading session
      const sessionName = `Batch ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .insert([{
          user_id: user.id,
          name: sessionName,
          description: `Multi-location reading with ${validReadings.length} data points`
        }])
        .select()
        .single();

      if (locationError) {
        toast.error("Failed to create batch location");
        console.error(locationError);
        return;
      }

      // Insert all individual readings
      const readingsToInsert = validReadings.map((reading, index) => ({
        user_id: user.id,
        location_id: locationData.id,
        nitrogen: parseFloat(reading.nitrogen),
        ph: parseFloat(reading.ph),
        moisture: parseFloat(reading.moisture),
        temperature: reading.temperature ? parseFloat(reading.temperature) : null,
        plant_type: reading.plant_type || `Location ${index + 1}`,
        reading_date: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('soil_readings')
        .insert(readingsToInsert);

      if (insertError) {
        console.error('Error inserting data:', insertError);
        toast.error("Failed to save soil data");
        return;
      }

      // Calculate and display aggregated results
      const avgNitrogen = calculateAverage(validReadings.map(r => parseFloat(r.nitrogen)));
      const avgPh = calculateAverage(validReadings.map(r => parseFloat(r.ph)));
      const avgMoisture = calculateAverage(validReadings.map(r => parseFloat(r.moisture)));
      const tempValues = validReadings
        .map(r => r.temperature ? parseFloat(r.temperature) : NaN)
        .filter(v => !isNaN(v));
      const avgTemp = tempValues.length > 0 ? calculateAverage(tempValues) : 0;

      toast.success(
        `✓ Data from ${validReadings.length} locations processed!\n` +
        `📊 Avg Nitrogen: ${avgNitrogen.toFixed(2)} mg/kg\n` +
        `🧪 Avg pH: ${avgPh.toFixed(2)}\n` +
        `💧 Avg Moisture: ${avgMoisture.toFixed(2)}%` +
        (avgTemp > 0 ? `\n🌡️ Avg Temperature: ${avgTemp.toFixed(1)}°C` : ""),
        { duration: 6000 }
      );

      // Reset form
      setReadings(Array(numLocations).fill(null).map(() => ({
        nitrogen: "",
        ph: "",
        moisture: "",
        temperature: "",
        plant_type: ""
      })));
      
      onDataAdded();
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while saving data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Multi-Location Soil Data Collection
        </CardTitle>
        <CardDescription>
          Collect soil data from multiple field locations to get accurate aggregated insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="numLocations">Number of Field Locations</Label>
            <Input
              id="numLocations"
              type="number"
              min="1"
              max="10"
              value={numLocations}
              onChange={(e) => handleNumLocationsChange(e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Collecting data from {numLocations} location{numLocations !== 1 ? 's' : ''} (1-10)
            </p>
          </div>

          <Separator />

          <div className="space-y-6">
            {readings.map((reading, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4 bg-card">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Location {index + 1}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`nitrogen-${index}`} className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      Nitrogen (mg/kg) *
                    </Label>
                    <Input
                      id={`nitrogen-${index}`}
                      type="number"
                      step="0.01"
                      value={reading.nitrogen}
                      onChange={(e) => updateReading(index, 'nitrogen', e.target.value)}
                      placeholder="e.g., 45.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`ph-${index}`} className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      pH Level *
                    </Label>
                    <Input
                      id={`ph-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="14"
                      value={reading.ph}
                      onChange={(e) => updateReading(index, 'ph', e.target.value)}
                      placeholder="e.g., 6.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`moisture-${index}`} className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      Moisture (%) *
                    </Label>
                    <Input
                      id={`moisture-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={reading.moisture}
                      onChange={(e) => updateReading(index, 'moisture', e.target.value)}
                      placeholder="e.g., 35.2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`temperature-${index}`} className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature (°C)
                    </Label>
                    <Input
                      id={`temperature-${index}`}
                      type="number"
                      step="0.01"
                      value={reading.temperature}
                      onChange={(e) => updateReading(index, 'temperature', e.target.value)}
                      placeholder="e.g., 22.5"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`plant_type-${index}`}>Plant Type</Label>
                    <Select
                      value={reading.plant_type}
                      onValueChange={(value) => updateReading(index, 'plant_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plant type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tomato">Tomato</SelectItem>
                        <SelectItem value="corn">Corn</SelectItem>
                        <SelectItem value="wheat">Wheat</SelectItem>
                        <SelectItem value="potato">Potato</SelectItem>
                        <SelectItem value="carrot">Carrot</SelectItem>
                        <SelectItem value="lettuce">Lettuce</SelectItem>
                        <SelectItem value="beans">Beans</SelectItem>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="soybean">Soybean</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing Data..." : "Submit All Readings & Get Results"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              * Required fields: Nitrogen, pH, and Moisture
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}