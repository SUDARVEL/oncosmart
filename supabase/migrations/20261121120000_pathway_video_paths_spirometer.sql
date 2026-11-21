-- The Incentive Spirometer videos now live in their own two folders.
-- Include them so the app can pick them up.

CREATE OR REPLACE FUNCTION public.list_pathway_video_paths()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = storage, public
AS $$
  SELECT coalesce(jsonb_agg(o.name ORDER BY o.name), '[]'::jsonb)
  FROM storage.objects o
  WHERE o.bucket_id = 'Oncosmart Videos and Assets'
    AND o.name ILIKE '%.mp4'
    AND split_part(o.name, '/', 1) IN (
      'Male - English',
      'Female - English',
      'Male - Tamil',
      'Female - Tamil',
      'Newly added Female',
      'Newly added Male',
      'Incentive Spirometer Male',
      'Incentive Spiromoter Female'
    );
$$;
