import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, Droplets, Leaf, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
}

interface EnhancedSoilDataFormProps {
  selectedLocationId?: string;
  onDataAdded: () => void;
}

export function EnhancedSoilDataForm({ selectedLocationId, onDataAdded }: EnhancedSoilDataFormProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location_id: selectedLocationId || '',
    nitrogen: '',
    ph: '',
    moisture: '',
    temperature: '',
    plant_type: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      setFormData(prev => ({ ...prev, location_id: selectedLocationId }));
    }
  }, [selectedLocationId]);

  const fetchLocations = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .eq('user_id', user.user.id)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location_id) {
      toast.error('Please select a location');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('You must be logged in to add soil data');
        return;
      }

      const soilData = {
        user_id: user.user.id,
        location_id: formData.location_id,
        nitrogen: parseFloat(formData.nitrogen),
        ph: parseFloat(formData.ph),
        moisture: parseFloat(formData.moisture),
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        plant_type: formData.plant_type || null,
        reading_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('soil_readings')
        .insert(soilData);

      if (error) throw error;

      toast.success('Soil data recorded successfully');
      
      // Reset form but keep location selected
      setFormData({
        location_id: formData.location_id,
        nitrogen: '',
        ph: '',
        moisture: '',
        temperature: '',
        plant_type: ''
      });

      onDataAdded();
    } catch (error) {
      console.error('Error adding soil data:', error);
      toast.error('Failed to record soil data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Please add at least one location before recording soil data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Record Soil Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Select
              value={formData.location_id}
              onValueChange={(value) => setFormData({ ...formData, location_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nitrogen" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Nitrogen (mg/kg)
              </Label>
              <Input
                id="nitrogen"
                type="number"
                step="0.01"
                value={formData.nitrogen}
                onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                placeholder="e.g., 25.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="ph" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                pH Level
              </Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                placeholder="e.g., 6.5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="moisture" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Moisture (%)
              </Label>
              <Input
                id="moisture"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.moisture}
                onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                placeholder="e.g., 65.0"
                required
              />
            </div>

            <div>
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                placeholder="e.g., 22.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="plant_type">Plant Type</Label>
            <Select
              value={formData.plant_type}
              onValueChange={(value) => setFormData({ ...formData, plant_type: value })}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Record Soil Data'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
