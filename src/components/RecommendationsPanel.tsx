
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, CheckCircle, Leaf } from "lucide-react";
import type { SoilData } from "@/pages/Index";

interface RecommendationsPanelProps {
  latestSoilData: SoilData | null;
}

export const RecommendationsPanel = ({ latestSoilData }: RecommendationsPanelProps) => {
  if (!latestSoilData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Record soil data to get personalized fertilizer and care recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { nitrogen, ph, moisture } = latestSoilData;

  // AI-driven recommendations based on soil values
  const recommendations = [];
  const alerts = [];
  const positives = [];

  // Nitrogen analysis
  if (nitrogen < 1.5) {
    alerts.push("Low nitrogen levels detected");
    recommendations.push({
      title: "Nitrogen Deficiency",
      description: "Apply organic compost or nitrogen-rich fertilizer. Consider planting legumes to fix nitrogen naturally.",
      priority: "high"
    });
  } else if (nitrogen > 4) {
    alerts.push("High nitrogen levels detected");
    recommendations.push({
      title: "Excess Nitrogen",
      description: "Reduce nitrogen inputs. Consider growing leafy vegetables that utilize high nitrogen.",
      priority: "medium"
    });
  } else {
    positives.push("Nitrogen levels are in good range");
  }

  // pH analysis
  if (ph < 6) {
    alerts.push("Acidic soil conditions");
    recommendations.push({
      title: "Soil Too Acidic",
      description: "Add lime or wood ash to raise pH. Most crops prefer 6.0-7.0 pH range.",
      priority: "high"
    });
  } else if (ph > 8) {
    alerts.push("Alkaline soil conditions");
    recommendations.push({
      title: "Soil Too Alkaline",
      description: "Add organic matter like compost or sulfur to lower pH gradually.",
      priority: "high"
    });
  } else {
    positives.push("pH levels are optimal for most crops");
  }

  // Moisture analysis
  if (moisture < 20) {
    alerts.push("Low soil moisture");
    recommendations.push({
      title: "Insufficient Moisture",
      description: "Increase watering frequency. Consider mulching to retain moisture.",
      priority: "high"
    });
  } else if (moisture > 80) {
    alerts.push("Excessive soil moisture");
    recommendations.push({
      title: "Overwatering Risk",
      description: "Reduce watering. Ensure proper drainage to prevent root rot.",
      priority: "medium"
    });
  } else {
    positives.push("Moisture levels are adequate");
  }

  // Crop suggestions based on current conditions
  const cropSuggestions = [];
  if (nitrogen >= 2 && ph >= 6 && ph <= 7 && moisture >= 30) {
    cropSuggestions.push("Leafy greens (spinach, lettuce)", "Tomatoes", "Beans");
  } else if (ph < 6.5 && moisture >= 40) {
    cropSuggestions.push("Blueberries", "Potatoes", "Sweet potatoes");
  } else if (nitrogen < 2 && ph >= 6.5) {
    cropSuggestions.push("Legumes (peas, beans)", "Root vegetables");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Based on your latest soil readings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Soil Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{alert}</span>
              </div>
            ))}
            {positives.map((positive, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{positive}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{rec.title}</h3>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Crop Suggestions */}
      {cropSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Leaf className="h-4 w-4" />
              Recommended Crops
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cropSuggestions.map((crop, index) => (
                <Badge key={index} variant="outline">
                  {crop}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Test soil regularly for best results</li>
            <li>• Apply organic matter to improve soil structure</li>
            <li>• Rotate crops to maintain soil health</li>
            <li>• Monitor weather conditions for optimal timing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
