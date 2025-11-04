export default function Help() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Help & Support</h1>
        <p className="text-sm text-gray-600">
          คำถามที่พบบ่อย ลิงก์ที่สำคัญ และวิธีติดต่อทีมงาน — แบบพื้นๆ
          ใช้งานได้ทันที
        </p>
      </header>

      {/* Search (non-functional placeholder) */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="ค้นหาวิธีใช้งานหรือปัญหา..."
          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50">
          ค้นหา
        </button>
      </div>

      {/* Quick links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="#getting-started"
          className="block p-4 rounded-2xl border hover:shadow-sm"
        >
          <h3 className="font-medium">เริ่มต้นใช้งาน</h3>
          <p className="text-sm text-gray-600">สิ่งที่ต้องรู้ภายใน 2 นาที</p>
        </a>
        <a href="#faq" className="block p-4 rounded-2xl border hover:shadow-sm">
          <h3 className="font-medium">คำถามที่พบบ่อย (FAQ)</h3>
          <p className="text-sm text-gray-600">แก้ปัญหาเบื้องต้นได้ทันที</p>
        </a>
      </section>

      {/* Getting started tips */}
      <section id="getting-started" className="space-y-3">
        <h2 className="text-lg font-semibold">เริ่มต้นใช้งาน</h2>
        <ol className="list-decimal pl-5 text-sm space-y-1 text-gray-700">
          <li>เข้าสู่ระบบด้วยบัญชีของคุณ</li>
          <li>ไปที่เมนูหลักเพื่อดูฟีเจอร์ทั้งหมด</li>
          <li>มีปัญหา? ลองดูหัวข้อ FAQ ก่อนติดต่อทีมงาน</li>
        </ol>
      </section>

      {/* FAQ using native details/summary for simplicity */}
      <section id="faq" className="space-y-3">
        <h2 className="text-lg font-semibold">คำถามที่พบบ่อย</h2>
        <details className="rounded-xl border p-3 open:shadow-sm">
          <summary className="cursor-pointer font-medium">
            ลืมรหัสผ่านทำอย่างไร?
          </summary>
          <div className="pt-2 text-sm text-gray-700">
            กดปุ่ม “ลืมรหัสผ่าน” บนหน้าเข้าสู่ระบบ
            แล้วทำตามขั้นตอนในอีเมลที่ได้รับ
          </div>
        </details>
        <details className="rounded-xl border p-3 open:shadow-sm">
          <summary className="cursor-pointer font-medium">
            ข้อมูลไม่อัปเดต ต้องทำยังไง?
          </summary>
          <div className="pt-2 text-sm text-gray-700">
            ลองรีเฟรชหน้า ตรวจสอบอินเทอร์เน็ต และออก-เข้าใช้งานใหม่อีกครั้ง
          </div>
        </details>
        <details className="rounded-xl border p-3 open:shadow-sm">
          <summary className="cursor-pointer font-medium">
            ติดต่อฝ่ายสนับสนุนได้ที่ไหน?
          </summary>
          <div className="pt-2 text-sm text-gray-700">
            ดูรายละเอียดการติดต่อด้านล่างได้เลย
          </div>
        </details>
      </section>

      {/* Contact */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">ติดต่อเรา</h2>
        <div className="rounded-2xl border p-4 text-sm text-gray-700">
          <p>
            อีเมล:{" "}
            <a
              className="text-blue-600 underline"
              href="mailto:support@example.com"
            >
              support@example.com
            </a>
          </p>
          <p>
            เอกสารการใช้งาน:{" "}
            <a className="text-blue-600 underline" href="#">
              เปิดคู่มือ
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-xs text-gray-500">
        อัปเดตล่าสุด: 2025-11-04 · เวอร์ชันหน้า Help: v1.0
      </footer>
    </div>
  );
}
