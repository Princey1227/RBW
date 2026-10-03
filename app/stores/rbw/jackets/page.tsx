import { redirect } from 'next/navigation';

export default function JacketsRedirect({ searchParams }: { searchParams: { wash?: string } }) {
  const wash = searchParams.wash;
  redirect(`/stores/rbw?category=jackets${wash ? `&wash=${wash}` : ''}`);
}
