import ProfileComponent from '@/components/dashboard/ProfileComponent';

export default function SuperAdminProfile() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil Super Admin</h1>
      </div>
      <ProfileComponent role="super_admin" />
    </div>
  );
}