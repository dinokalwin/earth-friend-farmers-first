-- Create locations table for field zones
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create soil_readings table for individual sensor data
CREATE TABLE public.soil_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  nitrogen DECIMAL(5, 2) NOT NULL,
  ph DECIMAL(4, 2) NOT NULL,
  moisture DECIMAL(5, 2) NOT NULL,
  temperature DECIMAL(5, 2),
  plant_type TEXT,
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create aggregated_data table for processed averages
CREATE TABLE public.aggregated_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  aggregation_type TEXT NOT NULL CHECK (aggregation_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  avg_nitrogen DECIMAL(5, 2) NOT NULL,
  avg_ph DECIMAL(4, 2) NOT NULL,
  avg_moisture DECIMAL(5, 2) NOT NULL,
  avg_temperature DECIMAL(5, 2),
  min_nitrogen DECIMAL(5, 2),
  max_nitrogen DECIMAL(5, 2),
  min_ph DECIMAL(4, 2),
  max_ph DECIMAL(4, 2),
  min_moisture DECIMAL(5, 2),
  max_moisture DECIMAL(5, 2),
  total_readings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_data ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Users can view their own locations" 
ON public.locations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations" 
ON public.locations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" 
ON public.locations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" 
ON public.locations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for soil_readings
CREATE POLICY "Users can view their own soil readings" 
ON public.soil_readings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own soil readings" 
ON public.soil_readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own soil readings" 
ON public.soil_readings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own soil readings" 
ON public.soil_readings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for aggregated_data
CREATE POLICY "Users can view their own aggregated data" 
ON public.aggregated_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own aggregated data" 
ON public.aggregated_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aggregated data" 
ON public.aggregated_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_soil_readings_user_id ON public.soil_readings(user_id);
CREATE INDEX idx_soil_readings_location_id ON public.soil_readings(location_id);
CREATE INDEX idx_soil_readings_date ON public.soil_readings(reading_date);
CREATE INDEX idx_aggregated_data_user_id ON public.aggregated_data(user_id);
CREATE INDEX idx_aggregated_data_period ON public.aggregated_data(aggregation_type, period_start, period_end);

-- Create function to aggregate soil data
CREATE OR REPLACE FUNCTION public.aggregate_soil_data(
  p_user_id UUID,
  p_aggregation_type TEXT,
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  -- Delete existing aggregation for this period
  DELETE FROM public.aggregated_data 
  WHERE user_id = p_user_id 
    AND aggregation_type = p_aggregation_type 
    AND period_start = p_period_start 
    AND period_end = p_period_end;

  -- Insert new aggregation
  INSERT INTO public.aggregated_data (
    user_id, aggregation_type, period_start, period_end,
    avg_nitrogen, avg_ph, avg_moisture, avg_temperature,
    min_nitrogen, max_nitrogen, min_ph, max_ph, min_moisture, max_moisture,
    total_readings
  )
  SELECT 
    p_user_id,
    p_aggregation_type,
    p_period_start,
    p_period_end,
    AVG(nitrogen)::DECIMAL(5,2),
    AVG(ph)::DECIMAL(4,2),
    AVG(moisture)::DECIMAL(5,2),
    AVG(temperature)::DECIMAL(5,2),
    MIN(nitrogen)::DECIMAL(5,2),
    MAX(nitrogen)::DECIMAL(5,2),
    MIN(ph)::DECIMAL(4,2),
    MAX(ph)::DECIMAL(4,2),
    MIN(moisture)::DECIMAL(5,2),
    MAX(moisture)::DECIMAL(5,2),
    COUNT(*)::INTEGER
  FROM public.soil_readings
  WHERE user_id = p_user_id 
    AND reading_date >= p_period_start 
    AND reading_date <= p_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;