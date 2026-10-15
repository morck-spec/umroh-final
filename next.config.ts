import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async rewrites() {
    return [
      {
        source: '/pilgrims',
        destination: '/dashboard/muthawif/pilgrims',
      },
      {
        source: '/pilgrims/:id',
        destination: '/dashboard/muthawif/pilgrims/:id',
      },
      {
        source: '/payments',
        destination: '/dashboard/superadmin/payments',
      },
      {
        source: '/payments/generate-massal',
        destination: '/dashboard/superadmin/payments/generate-massal',
      },
      {
        source: '/payments/registration/:id',
        destination: '/dashboard/superadmin/payments/registration/:id',
      },
      {
        source: '/registrations',
        destination: '/dashboard/superadmin/registrations',
      },
      {
        source: '/registrations/create',
        destination: '/dashboard/superadmin/registrations/create',
      },
      {
        source: '/registrations/:id/edit',
        destination: '/dashboard/superadmin/registrations/:id/edit',
      },
      {
        source: '/registrations/:id',
        destination: '/dashboard/superadmin/registrations/:id',
      },
      {
        source: '/pendaftaran',
        destination: '/dashboard/superadmin/registrations',
      },
      {
        source: '/pendaftaran/create',
        destination: '/dashboard/superadmin/registrations/create',
      },
      {
        source: '/pendaftaran/:id/edit',
        destination: '/dashboard/superadmin/registrations/:id/edit',
      },
      {
        source: '/pendaftaran/:id',
        destination: '/dashboard/superadmin/registrations/:id',
      },
      {
        source: '/manasik',
        destination: '/dashboard/superadmin/manasik',
      },
      {
        source: '/manasik/create',
        destination: '/dashboard/superadmin/manasik/create',
      },
      {
        source: '/manasik/:id',
        destination: '/dashboard/superadmin/manasik/:id',
      },
      {
        source: '/manasik/:id/edit',
        destination: '/dashboard/superadmin/manasik/:id/edit',
      },
      {
        source: '/manifests',
        destination: '/dashboard/superadmin/manifests',
      },
      {
        source: '/manifests/:id',
        destination: '/dashboard/superadmin/manifests/:id',
      },
      {
        source: '/equipment',
        destination: '/dashboard/superadmin/equipment',
      },
      {
        source: '/equipment/create',
        destination: '/dashboard/superadmin/equipment/create',
      },
      {
        source: '/equipment/:id/edit',
        destination: '/dashboard/superadmin/equipment/:id/edit',
      },
      {
        source: '/commissions',
        destination: '/dashboard/superadmin/commissions',
      },
      {
        source: '/announcements',
        destination: '/dashboard/superadmin/announcements',
      },
      {
        source: '/announcements/create',
        destination: '/dashboard/superadmin/announcements/create',
      },
      {
        source: '/announcements/:id/edit',
        destination: '/dashboard/superadmin/announcements/:id/edit',
      },
      {
        source: '/users',
        destination: '/dashboard/superadmin/users',
      },
      {
        source: '/users/create',
        destination: '/dashboard/superadmin/users/create',
      },
      {
        source: '/users/:id/edit',
        destination: '/dashboard/superadmin/users/:id/edit',
      },
      {
        source: '/settings',
        destination: '/dashboard/superadmin/settings',
      },
      {
        source: '/activity-logs',
        destination: '/dashboard/superadmin/activity-logs',
      },
      {
        source: '/branches',
        destination: '/dashboard/superadmin/branches',
      },
      {
        source: '/branches/create',
        destination: '/dashboard/superadmin/branches/create',
      },
      {
        source: '/branches/:id/edit',
        destination: '/dashboard/superadmin/branches/:id/edit',
      },
      {
        source: '/packages',
        destination: '/dashboard/superadmin/packages',
      },
      {
        source: '/packages/create',
        destination: '/dashboard/superadmin/packages/create',
      },
      {
        source: '/packages/:id/edit',
        destination: '/dashboard/superadmin/packages/:id/edit',
      },
      {
        source: '/packages/:id',
        destination: '/dashboard/superadmin/packages/:id',
      },
      {
        source: '/paket',
        destination: '/dashboard/superadmin/packages',
      },
      {
        source: '/paket/create',
        destination: '/dashboard/superadmin/packages/create',
      },
      {
        source: '/paket/:id/edit',
        destination: '/dashboard/superadmin/packages/:id/edit',
      },
      {
        source: '/paket/:id',
        destination: '/dashboard/superadmin/packages/:id',
      },
      {
        source: '/jamaah',
        destination: '/dashboard/superadmin/jamaah',
      },
      {
        source: '/jamaah/create',
        destination: '/dashboard/superadmin/jamaah/create',
      },
      {
        source: '/jamaah/:id',
        destination: '/dashboard/superadmin/jamaah/:id',
      },
      {
        source: '/jamaah/:id/edit',
        destination: '/dashboard/superadmin/jamaah/:id/edit',
      },
      {
        source: '/pilgrims',
        destination: '/dashboard/superadmin/jamaah',
      },
      {
        source: '/pilgrims/create',
        destination: '/dashboard/superadmin/jamaah/create',
      },
      {
        source: '/pilgrims/:id',
        destination: '/dashboard/superadmin/jamaah/:id',
      },
      {
        source: '/pilgrims/:id/edit',
        destination: '/dashboard/superadmin/jamaah/:id/edit',
      },
      {
        source: '/guides',
        destination: '/dashboard/superadmin/guides',
      },
      {
        source: '/guides/create',
        destination: '/dashboard/superadmin/guides/create',
      },
      {
        source: '/guides/:id/edit',
        destination: '/dashboard/superadmin/guides/:id/edit',
      },
      {
        source: '/muthawif',
        destination: '/dashboard/superadmin/guides',
      },
      {
        source: '/muthawif/create',
        destination: '/dashboard/superadmin/guides/create',
      },
      {
        source: '/muthawif/:id/edit',
        destination: '/dashboard/superadmin/guides/:id/edit',
      },
      {
        source: '/agents',
        destination: '/dashboard/superadmin/agents',
      },
      {
        source: '/agents/create',
        destination: '/dashboard/superadmin/agents/create',
      },
      {
        source: '/agents/:id/edit',
        destination: '/dashboard/superadmin/agents/:id/edit',
      },
      {
        source: '/agen',
        destination: '/dashboard/superadmin/agents',
      },
      {
        source: '/agen/create',
        destination: '/dashboard/superadmin/agents/create',
      },
      {
        source: '/agen/:id/edit',
        destination: '/dashboard/superadmin/agents/:id/edit',
      },
      {
        source: '/airlines',
        destination: '/dashboard/superadmin/airlines',
      },
      {
        source: '/airlines/create',
        destination: '/dashboard/superadmin/airlines/create',
      },
      {
        source: '/airlines/:id/edit',
        destination: '/dashboard/superadmin/airlines/:id/edit',
      },
      {
        source: '/maskapai',
        destination: '/dashboard/superadmin/airlines',
      },
      {
        source: '/maskapai/create',
        destination: '/dashboard/superadmin/airlines/create',
      },
      {
        source: '/maskapai/:id/edit',
        destination: '/dashboard/superadmin/airlines/:id/edit',
      },
      {
        source: '/hotels',
        destination: '/dashboard/superadmin/hotels',
      },
      {
        source: '/hotels/create',
        destination: '/dashboard/superadmin/hotels/create',
      },
      {
        source: '/hotels/:id/edit',
        destination: '/dashboard/superadmin/hotels/:id/edit',
      },
      {
        source: '/hotel',
        destination: '/dashboard/superadmin/hotels',
      },
      {
        source: '/hotel/create',
        destination: '/dashboard/superadmin/hotels/create',
      },
      {
        source: '/hotel/:id/edit',
        destination: '/dashboard/superadmin/hotels/:id/edit',
      },
      {
        source: '/bank-accounts',
        destination: '/dashboard/superadmin/bank-accounts',
      },
      {
        source: '/bank-accounts/create',
        destination: '/dashboard/superadmin/bank-accounts/create',
      },
      {
        source: '/bank-accounts/:id/edit',
        destination: '/dashboard/superadmin/bank-accounts/:id/edit',
      },
      {
        source: '/rekening-bank',
        destination: '/dashboard/superadmin/bank-accounts',
      },
      {
        source: '/rekening-bank/create',
        destination: '/dashboard/superadmin/bank-accounts/create',
      },
      {
        source: '/rekening-bank/:id/edit',
        destination: '/dashboard/superadmin/bank-accounts/:id/edit',
      },
    ];
  },
};

export default nextConfig;