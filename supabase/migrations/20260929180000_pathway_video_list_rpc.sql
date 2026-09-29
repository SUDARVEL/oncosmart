-- Allow the mobile app (anon) to read pathway video object paths from storage.
-- Storage list API is blocked for anon; this RPC returns public object names only.

CREATE OR REPLACE FUNCTION public.list_pathway_video_paths()
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = storage, public
AS $$
  SELECT o.name
  FROM storage.objects o
  WHERE o.bucket_id = 'Oncosmart Videos and Assets'
    AND o.name ILIKE '%.mp4'
    AND split_part(o.name, '/', 1) IN (
      'Male - English',
      'Female - English',
      'Male - Tamil',
      'Female - Tamil'
    )
  ORDER BY o.name;
$$;

REVOKE ALL ON FUNCTION public.list_pathway_video_paths() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_pathway_video_paths() TO anon, authenticated, service_role;
