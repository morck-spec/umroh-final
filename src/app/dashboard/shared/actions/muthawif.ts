'use server';

import fs from 'fs';
import path from 'path';

export interface MuthawifPilgrim {
  id: string;
  code: string;
  name: string;
  status: string;
  nik: string;
  phone: string;
  email: string;
  passport_number: string;
  passport_expiry: string;
  city: string;
  gender?: string;
  birth_info?: string;
  blood_type?: string;
  address?: string;
  passport_issued_place?: string;
  passport_issued_date?: string;
  mahram_name?: string;
  mahram_relation?: string;
  emergency_name?: string;
  emergency_phone?: string;
  health_notes?: string;
  package_name?: string;
  registration_code?: string;
  registration_date?: string;
  registration_status?: string;
  branch_name?: string;
  agent_name?: string;
  login_access?: string;
  document_count?: number;
}

const DEFAULT_PILGRIMS: MuthawifPilgrim[] = [
  {
    id: '1',
    code: 'JM-0001',
    name: 'Ahmad Fauzi',
    status: 'Aktif',
    nik: '3201000000000001',
    phone: '081200000001',
    email: 'jamaah@example.com',
    passport_number: 'A1000000',
    passport_expiry: 'Exp Oct 2029',
    city: '-',
    gender: 'Laki-laki',
    birth_info: 'Jakarta, 01 Jan 1975 (51 th)',
    blood_type: 'A',
    address: 'Jl. Contoh No. 1, Jakarta, Jakarta',
    passport_issued_place: 'Jakarta',
    passport_issued_date: '14 Oct 2024',
    mahram_name: '-',
    mahram_relation: '-',
    emergency_name: 'Keluarga Ahmad Fauzi',
    emergency_phone: '081300000001',
    health_notes: 'Tidak ada catatan kesehatan.',
    package_name: 'Umroh Reguler 9 Hari',
    registration_code: 'REG-00001',
    registration_date: '14 Nov 2025',
    registration_status: 'Dikonfirmasi',
    branch_name: 'Kantor Pusat Jakarta',
    agent_name: '-',
    login_access: 'Aktif',
    document_count: 6,
  },
  {
    id: '4',
    code: 'JM-0004',
    name: 'Dewi Anggraini',
    status: 'Aktif',
    nik: '3201000000000004',
    phone: '081200000004',
    email: 'jamaah4@example.com',
    passport_number: 'A1000003',
    passport_expiry: 'Exp Jul 2029',
    city: 'Mekkah (Hotel 1)',
    gender: 'Laki-laki',
    birth_info: 'Semarang, 10 Mar 1992 (34 th)',
    blood_type: 'AB',
    address: 'Jl. Pandanaran No. 4, Semarang',
    passport_issued_place: 'Semarang',
    passport_issued_date: '22 Jul 2024',
    mahram_name: '-',
    mahram_relation: '-',
    emergency_name: 'Bambang Anggraini',
    emergency_phone: '081300000004',
    health_notes: 'Tidak ada catatan kesehatan.',
    package_name: 'Haji Plus Eksklusif',
    registration_code: 'REG-00004',
    registration_date: '26 Jul 2026',
    registration_status: 'Dikonfirmasi',
    branch_name: 'Kantor Pusat Jakarta',
    agent_name: 'Hasan Basri',
    login_access: 'Aktif',
    document_count: 6,
  },
  {
    id: '7',
    code: 'JM-0007',
    name: 'Gunawan Wibowo',
    status: 'Aktif',
    nik: '3201000000000007',
    phone: '081200000007',
    email: 'jamaah7@example.com',
    passport_number: 'A1000006',
    passport_expiry: 'Exp Oct 2029',
    city: 'Mekkah (Hotel 1)',
    gender: 'Laki-laki',
    birth_info: 'Solo, 05 Dec 1972 (54 th)',
    blood_type: 'O',
    address: 'Jl. Slamet Riyadi No. 50, Solo',
    passport_issued_place: 'Solo',
    passport_issued_date: '01 Oct 2024',
    mahram_name: '-',
    mahram_relation: '-',
    emergency_name: 'Endang Wibowo',
    emergency_phone: '081300000007',
    health_notes: 'Tidak ada catatan kesehatan.',
    package_name: 'Umroh Plus Turki 12 Hari',
    registration_code: 'REG-00007',
    registration_date: '28 Jul 2026',
    registration_status: 'Dikonfirmasi',
    branch_name: 'Kantor Pusat Jakarta',
    agent_name: 'Hasan Basri',
    login_access: 'Aktif',
    document_count: 6,
  },
  {
    id: '10',
    code: 'JM-0010',
    name: 'Joko Widodo',
    status: 'Aktif',
    nik: '3201000000000010',
    phone: '081200000010',
    email: 'jamaah10@example.com',
    passport_number: 'A1000009',
    passport_expiry: 'Exp Jul 2029',
    city: 'Mekkah (Hotel 1)',
    gender: 'Laki-laki',
    birth_info: 'Solo, 21 Jun 1961 (65 th)',
    blood_type: 'O',
    address: 'Jl. Letjen Suprapto No. 1, Solo',
    passport_issued_place: 'Solo',
    passport_issued_date: '05 Jul 2024',
    mahram_name: '-',
    mahram_relation: '-',
    emergency_name: 'Iriana Widodo',
    emergency_phone: '081300000010',
    health_notes: 'Tidak ada catatan kesehatan.',
    package_name: 'Umroh Reguler 9 Hari',
    registration_code: 'REG-00010',
    registration_date: '31 Jul 2026',
    registration_status: 'Dikonfirmasi',
    branch_name: 'Kantor Pusat Jakarta',
    agent_name: 'Hasan Basri',
    login_access: 'Aktif',
    document_count: 6,
  },
];

export async function getMuthawifPilgrims(): Promise<MuthawifPilgrim[]> {
  try {
    const file = path.join(process.cwd(), 'src', 'data', 'jamaah.json');
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      const all: any[] = JSON.parse(raw);
      // Filter for the 4 pilgrims under Ustadz Abdullah
      const targetIds = ['1', '4', '7', '10'];
      const matched = all.filter((j) => targetIds.includes(String(j.id || j.legacy_id)));
      if (matched.length > 0) {
        return matched.map((j) => {
          const fallback = DEFAULT_PILGRIMS.find((d) => String(d.id) === String(j.id || j.legacy_id)) || DEFAULT_PILGRIMS[0];
          return {
            id: String(j.id || j.legacy_id),
            code: j.code || fallback.code,
            name: j.full_name || fallback.name,
            status: j.status || 'Aktif',
            nik: j.nik || fallback.nik,
            phone: j.phone || fallback.phone,
            email: j.email || fallback.email,
            passport_number: j.passport_number || fallback.passport_number,
            passport_expiry: fallback.passport_expiry,
            city: fallback.city,
            gender: j.gender || fallback.gender,
            birth_info: fallback.birth_info,
            blood_type: j.blood_type || fallback.blood_type,
            address: j.address || fallback.address,
            passport_issued_place: j.passport_issued_place || fallback.passport_issued_place,
            passport_issued_date: j.passport_issued_date || fallback.passport_issued_date,
            mahram_name: j.mahram_name || fallback.mahram_name,
            mahram_relation: j.mahram_relation || fallback.mahram_relation,
            emergency_name: j.emergency_contact_name || fallback.emergency_name,
            emergency_phone: j.emergency_contact_phone || fallback.emergency_phone,
            health_notes: j.health_notes || fallback.health_notes,
            package_name: fallback.package_name,
            registration_code: fallback.registration_code,
            registration_date: fallback.registration_date,
            registration_status: fallback.registration_status,
            branch_name: j.branch_name || fallback.branch_name,
            agent_name: j.agent_name || fallback.agent_name,
            login_access: j.account_login || 'Aktif',
            document_count: j.document_count || 6,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Error reading jamaah for muthawif:', err);
  }

  return DEFAULT_PILGRIMS;
}

export async function getMuthawifPilgrimDetail(id: string): Promise<MuthawifPilgrim | null> {
  const list = await getMuthawifPilgrims();
  const found = list.find((p) => p.id === id || p.code === id);
  if (found) return found;

  const fallback = DEFAULT_PILGRIMS.find((p) => p.id === id || p.code === id);
  return fallback || DEFAULT_PILGRIMS[0];
}
