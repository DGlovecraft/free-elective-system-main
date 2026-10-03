"use client";

type HeaderProps = {
  role: "student" | "teacher";
};

export default function Header({ role }: HeaderProps) {
  return (
    <header className="h-[76px] border-b border-[#dbe7f2] bg-white">
      <div className="flex h-full items-center justify-between px-5 lg:px-8">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d3b70] text-xl text-white">
            🎓
          </div>

          <div>
            <h1 className="text-base font-bold text-[#17365d]">
              ระบบเสนอรายวิชาเสรี
            </h1>

            <p className="text-xs text-slate-400">
              สำหรับนักศึกษา
            </p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[#17365d]">
              {role === "teacher"
                ? "อาจารย์ผู้ดูแลระบบ"
                : "นักศึกษา"}
            </p>

            {role === "teacher" && (
              <p className="text-xs text-slate-400">
                ผู้ดูแลระบบ
              </p>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf3ff] text-lg">
            👤
          </div>
        </div>

      </div>
    </header>
  );
}