import { currentUser } from '@/lib/auth';
export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId } });
}
