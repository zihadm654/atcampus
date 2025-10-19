import { getCurrentUser } from "@/lib/session";

export default async function ProfilePage() {
  // Server-side validation without any API calls
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 font-bold text-3xl">Profile</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Status:</strong> {user.status}
        </p>
      </div>
    </div>
  );
}
