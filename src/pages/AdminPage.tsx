import { useEffect, useState } from "react";
import { isAdminAuthenticated, signInAdmin, signOutAdmin } from "../lib/adminAuth";
import { submissionsRepository } from "../lib/data";
import type { Submission, SubmissionStatus } from "../lib/types";

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: "بانتظار المراجعة",
  approved: "معتمدة",
  rejected: "مرفوضة",
};

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInAdmin(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="text-center font-display text-2xl font-bold text-saudi-green-dark">دخول لوحة الإدارة</h1>
      <form onSubmit={handleSubmit} className="glass mt-6 space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm text-ink/70">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-saudi-green/20 bg-white/70 p-3 focus:border-saudi-green focus:outline-none"
            placeholder="admin@example.com"
            required={false}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink/70">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-saudi-green/20 bg-white/70 p-3 focus:border-saudi-green focus:outline-none"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-saudi-green-dark py-3 font-bold text-ivory disabled:opacity-50"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const all = await submissionsRepository.listAll();
    setSubmissions(all);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleStatus(id: string, status: SubmissionStatus) {
    await submissionsRepository.updateStatus(id, status);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذه المشاركة نهائيًا؟")) return;
    await submissionsRepository.deleteSubmission(id);
    refresh();
  }

  const filtered = submissions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !s.text.includes(search)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-saudi-green-dark">لوحة الإدارة</h1>
        <button
          type="button"
          onClick={async () => {
            await signOutAdmin();
            onSignOut();
          }}
          className="rounded-full border border-saudi-green-dark/30 px-4 py-2 text-sm text-saudi-green-dark"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f ? "bg-saudi-green-dark text-ivory" : "bg-white/70 text-ink/60 hover:bg-white"
            }`}
          >
            {f === "all" ? "الكل" : STATUS_LABEL[f]}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في نص المشاركات..."
          className="mr-auto w-full max-w-xs rounded-full border border-saudi-green/20 bg-white/70 px-4 py-2 text-sm focus:border-saudi-green focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-center text-ink/50">جاري التحميل...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-saudi-green/10 bg-white/60">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="border-b border-saudi-green/10 text-ink/50">
              <tr>
                <th className="p-3">النص</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الكلمات</th>
                <th className="p-3">القطعة</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-saudi-green/5 align-top">
                  <td className="max-w-xs p-3">{s.text}</td>
                  <td className="p-3">{s.inputType === "voice" ? "صوتي" : "كتابي"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {s.keywords.map((k) => (
                        <span key={k} className="rounded-full bg-saudi-green/10 px-2 py-0.5 text-xs text-saudi-green-dark">
                          {k}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">{s.tileIndex ?? "—"}</td>
                  <td className="p-3 whitespace-nowrap text-xs text-ink/50">
                    {new Date(s.createdAt).toLocaleString("ar-SA")}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {s.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => handleStatus(s.id, "approved")}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white"
                        >
                          اعتماد
                        </button>
                      )}
                      {s.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => handleStatus(s.id, "rejected")}
                          className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white"
                        >
                          رفض
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-ink/40">
                    لا توجد مشاركات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    isAdminAuthenticated().then(setAuthed);
  }, []);

  if (authed === null) return <p className="py-24 text-center text-ink/40">...</p>;

  return authed ? <Dashboard onSignOut={() => setAuthed(false)} /> : <LoginForm onSuccess={() => setAuthed(true)} />;
}
