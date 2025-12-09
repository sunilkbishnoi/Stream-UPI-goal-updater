-- Create table to store freecharge transactions synced via bookmarklet
CREATE TABLE public.freecharge_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (but allow public access since no auth)
ALTER TABLE public.freecharge_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and insert (no auth required for this simple tracker)
CREATE POLICY "Allow public read access" 
ON public.freecharge_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.freecharge_transactions 
FOR INSERT 
WITH CHECK (true);