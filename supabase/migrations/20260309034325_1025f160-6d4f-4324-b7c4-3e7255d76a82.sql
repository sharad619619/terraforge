
-- Create datasets table
CREATE TABLE public.datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_runs table
CREATE TABLE public.analysis_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE NOT NULL,
  target_mineral TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prediction_zones table
CREATE TABLE public.prediction_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE CASCADE NOT NULL,
  zone_id TEXT NOT NULL,
  probability DOUBLE PRECISION NOT NULL,
  classification TEXT NOT NULL,
  factors JSONB NOT NULL DEFAULT '{}',
  geojson JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE CASCADE NOT NULL,
  report_url TEXT,
  status TEXT NOT NULL DEFAULT 'generating',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- For this MVP demo, allow all operations (no auth required)
CREATE POLICY "Allow all access to datasets" ON public.datasets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to analysis_runs" ON public.analysis_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to prediction_zones" ON public.prediction_zones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON public.datasets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analysis_runs_updated_at BEFORE UPDATE ON public.analysis_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', true);
CREATE POLICY "Allow public read access to datasets bucket" ON storage.objects FOR SELECT USING (bucket_id = 'datasets');
CREATE POLICY "Allow public upload to datasets bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'datasets');
CREATE POLICY "Allow public delete from datasets bucket" ON storage.objects FOR DELETE USING (bucket_id = 'datasets');
