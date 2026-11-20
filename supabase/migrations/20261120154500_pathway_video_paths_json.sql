-- PostgREST caps SETOF results at 1000 rows, which dropped every
-- "Newly added" clip. Return one JSON array so the full list arrives.

DROP FUNCTION public.list_pathway_video_paths();

CREATE FUNCTION public.list_pathway_video_paths()
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
      'Newly added Male'
    );
$$;

REVOKE ALL ON FUNCTION public.list_pathway_video_paths() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_pathway_video_paths() TO anon, authenticated, service_role;
