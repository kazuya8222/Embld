-- Create storage bucket for app screenshots
insert into storage.buckets (id, name, public)
values ('app-screenshots', 'app-screenshots', true);

-- Set up RLS policy for the bucket
create policy "Anyone can view app screenshots" on storage.objects for select using (bucket_id = 'app-screenshots');

-- Allow authenticated users to upload screenshots
create policy "Authenticated users can upload screenshots" on storage.objects for insert with check (bucket_id = 'app-screenshots' and auth.role() = 'authenticated');

-- Allow developers to update their own screenshots
create policy "Users can update own screenshots" on storage.objects for update using (bucket_id = 'app-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow developers to delete their own screenshots
create policy "Users can delete own screenshots" on storage.objects for delete using (bucket_id = 'app-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);