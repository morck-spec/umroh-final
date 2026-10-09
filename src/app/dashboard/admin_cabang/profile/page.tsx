import ProfileComponent from '@/components/dashboard/ProfileComponent';

export default function AdminCabangProfile() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil Admin Cabang</h1>
      </div>
      <ProfileComponent role="admin_cabang" />
    </div>
  );
}