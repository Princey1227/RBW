import { redirect } from 'next/navigation';

export default function TemplateShortsRedirect({ searchParams }: { searchParams: { wash?: string } }) {
  const wash = searchParams.wash;
  redirect(`/stores/template?category=shorts${wash ? `&wash=${wash}` : ''}`);
}
