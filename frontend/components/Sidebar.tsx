"use client";

import Link from "next/link";

type SidebarProps = {
active: "home" | "suggestion" | "analysis" | "submissions" | "categories";
role: "student" | "teacher";
};

export default function Sidebar({
active,
role,
}: SidebarProps) {
const studentMenus = [
  {
    key: "home" as const,
    label: "หน้าหลัก",
    href: "/student",
    icon: "⌂",
  },
  {
    key: "suggestion" as const,
    label: "เสนอรายวิชาเสรี",
    href: "/student/suggestion",
    icon: "✓",
  },
];

const teacherMenus = [
  {
    key: "home" as const,
    label: "หน้าหลัก",
    href: "/teacher",
    icon: "⌂",
  },
  {
    key: "analysis" as const,
    label: "ผลการวิเคราะห์",
    href: "/teacher/analysis",
    icon: "▣",
  },
  {
    key: "submissions" as const,
    label: "รายการข้อเสนอ",
    href: "/teacher/submissions",
    icon: "▤",
  },
  {
    key: "categories" as const,
    label: "รายละเอียดหมวดหมู่",
    href: "/teacher/categories",
    icon: "◈",
  },
];

const menus =
  role === "teacher" ? teacherMenus : studentMenus;

return (
  <aside className="hidden w-[230px] shrink-0 bg-[#102f55] md:block">
    <div className="flex min-h-[calc(100vh-76px)] flex-col">

      <nav className="p-3">
        {menus.map((menu) => {
          const isActive = active === menu.key;

          return (
            <Link
              key={menu.key}
              href={menu.href}
              className={[
                "mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition",
                isActive
                  ? "bg-[#1264d8] font-semibold text-white"
                  : "text-blue-100 hover:bg-white/10",
              ].join(" ")}
            >
              <span className="w-5 text-center">
                {menu.icon}
              </span>

              <span>{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-5 text-center">
        <div className="mb-4 text-3xl">
          🎓
        </div>

        <p className="text-xs leading-6 text-blue-100">
          "ทุกไอเดียของคุณ
          <br />
          อาจเป็นรายวิชาในอนาคต"
        </p>
      </div>

    </div>
  </aside>
);
}