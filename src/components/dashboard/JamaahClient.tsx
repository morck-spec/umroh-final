'use client';

import JamaahListClient from './JamaahListClient';
import { JamaahItem } from '@/app/dashboard/shared/actions/jamaah';

export default function JamaahClient({
  initialJamaah,
  branches,
  role,
  currentBranchId,
  basePath,
}: {
  initialJamaah: any[];
  branches?: any[];
  role?: string;
  currentBranchId?: string;
  basePath?: string;
}) {
  return (
    <JamaahListClient
      initialJamaah={initialJamaah as JamaahItem[]}
      basePath={basePath || (role === 'admin_cabang' ? '/dashboard/admin_cabang/jamaah' : role === 'admin' ? '/dashboard/admin/jamaah' : '/dashboard/superadmin/jamaah')}
      role={role}
    />
  );
}
