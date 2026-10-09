import ProfileComponent from '@/components/dashboard/ProfileComponent';

export default function AdminProfile() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil Admin</h1>
      </div>
      <ProfileComponent role="admin" />
    </div>
  );
}