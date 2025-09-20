import { getCurrentUser } from "@/lib/session";

export default async function ProfilePage() {
  // Server-side validation without any API calls
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
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
