export type Profile = {
  id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  email: string | null;
  linkedin_url: string | null;
  resume_pdf_path: string | null;
  updated_at: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  role: string | null;
  year: string | null;
  tags: string[] | null;
  cover_path: string | null;
  gallery_x: number | null;
  gallery_y: number | null;
  gallery_z: number | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type ProjectSection = {
  id: string;
  project_id: string;
  heading: string;
  body: string;
  images: string[] | null;
  sort_order: number;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};
