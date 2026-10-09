"use client";

import { Briefcase } from "lucide-react";

export function DemoAccounts() {
  const fillDemo = (email: string) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    if (emailInput && passwordInput) {
      // Use native value setter for React compatibility
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

      nativeInputValueSetter?.call(emailInput, email);
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));

      nativeInputValueSetter?.call(passwordInput, 'password123');
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const accounts = [
    { email: 'super_admin@demo.com', role: 'Super Admin', color: 'red' },
    { email: 'admin@demo.com', role: 'Admin', color: 'blue' },
    { email: 'admin_cabang@demo.com', role: 'Admin Cabang', color: 'purple' },
    { email: 'jamaah@demo.com', role: 'Jamaah', color: 'emerald' },
  ];

  return (
    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-sm shadow-sm">
      <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
        <Briefcase className="w-4 h-4" /> Demo Accounts
      </h3>
      <p className="text-emerald-700 mb-3 text-xs">Klik akun di bawah ini untuk mengisi form secara otomatis.</p>
      <div className="space-y-2 text-xs">
        {accounts.map(acc => {
          // Determine classes based on color to prevent purge
          let bgClass = "bg-emerald-50";
          let textClass = "text-emerald-600";

          if (acc.color === "red") {
            bgClass = "bg-red-50";
            textClass = "text-red-600";
          } else if (acc.color === "blue") {
            bgClass = "bg-blue-50";
            textClass = "text-blue-600";
          } else if (acc.color === "purple") {
            bgClass = "bg-purple-50";
            textClass = "text-purple-600";
          }

          return (
            <div
              key={acc.email}
              onClick={() => fillDemo(acc.email)}
              className="flex justify-between items-center bg-white p-2 rounded border border-emerald-100 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-colors"
            >
              <span className="font-medium text-slate-700">{acc.email}</span>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${textClass} ${bgClass} px-2 py-0.5 rounded-full`}>
                {acc.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
