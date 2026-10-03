import { redirect } from 'next/navigation';

export default function TemplateJacketsRedirect({ searchParams }: { searchParams: { wash?: string } }) {
  const wash = searchParams.wash;
  redirect(`/stores/template?category=jackets${wash ? `&wash=${wash}` : ''}`);
}
