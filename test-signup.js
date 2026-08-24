import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://awxanbbjroyjahlknqvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eGFuYmJqcm95amFobGtucXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4ODk1MDAsImV4cCI6MjAzMjQ2NTUwMH0.m5lVnL1O5Z1jO9b7n9I1gZ0lQyGjW9C5v9Z1jO9b7n9' // Need to get the actual key from .env.local
);
