
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Droplets, Zap, TestTube } from "lucide-react";
import type { SoilData } from "@/pages/Index";

interface SoilDataFormProps {
  onSubmit: (data: Omit<SoilData, 'id' | 'date'>) => void;
}

export const SoilDataForm = ({ onSubmit }: SoilDataFormProps) => {
  const [formData, setFormData] = useState({
    nitrogen: '',
    ph: '',
    moisture: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nitrogen = parseFloat(formData.nitrogen);
    const ph = parseFloat(formData.ph);
    const moisture = parseFloat(formData.moisture);

    // Basic validation
    if (isNaN(nitrogen) || isNaN(ph) || isNaN(moisture)) {
      return;
    }

    if (nitrogen < 0 || nitrogen > 100 || ph < 0 || ph > 14 || moisture < 0 || moisture > 100) {
      return;
    }

    onSubmit({
      nitrogen,
      ph,
      moisture,
      notes: formData.notes.trim()
    });

    // Reset form
    setFormData({
      nitrogen: '',
      ph: '',
      moisture: '',
      notes: ''
    });
  };

  const isValid = formData.nitrogen && formData.ph && formData.moisture;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Record Soil Data
        </CardTitle>
        <CardDescription>
          Enter your soil measurements to track health over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nitrogen" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Nitrogen Level (%)
            </Label>
            <Input
              id="nitrogen"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 2.5"
              value={formData.nitrogen}
              onChange={(e) => setFormData(prev => ({ ...prev, nitrogen: e.target.value }))}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ph" className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-blue-500" />
              pH Level
            </Label>
            <Input
              id="ph"
              type="number"
              min="0"
              max="14"
              step="0.1"
              placeholder="e.g., 6.5"
              value={formData.ph}
              onChange={(e) => setFormData(prev => ({ ...prev, ph: e.target.value }))}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moisture" className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              Moisture Level (%)
            </Label>
            <Input
              id="moisture"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g., 35.0"
              value={formData.moisture}
              onChange={(e) => setFormData(prev => ({ ...prev, moisture: e.target.value }))}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any observations about your field..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid}
          >
            Record Soil Data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
