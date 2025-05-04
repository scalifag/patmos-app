-- Create a table for companies with RLS (Row Level Security)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  database_name TEXT NOT NULL,
  service_layer_url TEXT NOT NULL,
  credentials TEXT NOT NULL, -- Base64 encoded
  last_sync_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS companies_user_id_idx ON companies(user_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own companies
CREATE POLICY "Users can view their own companies" 
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own companies
CREATE POLICY "Users can insert their own companies" 
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own companies
CREATE POLICY "Users can update their own companies" 
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own companies
CREATE POLICY "Users can delete their own companies" 
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before update
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 