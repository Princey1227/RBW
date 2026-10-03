import { redirect } from 'next/navigation';

export default function ShortsRedirect({ searchParams }: { searchParams: { wash?: string } }) {
  const wash = searchParams.wash;
  redirect(`/stores/rbw?category=shorts${wash ? `&wash=${wash}` : ''}`);
}
