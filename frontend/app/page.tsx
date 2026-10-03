"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

const DEMO_USERS = [
  {
    email: "student1@demo.com",
    password: "123456",
    role: "student",
    student_id: "65000001",
    year: 1,
    major: "วิทยาการคอมพิวเตอร์และสารสนเทศ",
  },
  {
    email: "student2@demo.com",
    password: "123456",
    role: "student",
    student_id: "65000002",
    year: 2,
    major: "วิทยาการคอมพิวเตอร์และสารสนเทศ",
  },
  {
    email: "student3@demo.com",
    password: "123456",
    role: "student",
    student_id: "65000003",
    year: 3,
    major: "วิทยาการคอมพิวเตอร์และสารสนเทศ",
  },
  {
    email: "student4@demo.com",
    password: "123456",
    role: "student",
    student_id: "65000004",
    year: 4,
    major: "วิทยาการคอมพิวเตอร์และสารสนเทศ",
  },
  {
    email: "teacher@demo.com",
    password: "123456",
    role: "teacher",
    student_id: "",
    year: 0,
    major: "",
  },
];

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const googleButtonRef =
    useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // Google Account ที่ Login อยู่
  // ==========================================
  const [googleUser, setGoogleUser] =
    useState<any>(null);

  // ==========================================
  // แสดงหน้าผูก Student ID หรือไม่
  // ==========================================
  const [showLinkStudent, setShowLinkStudent] =
    useState(false);

  const [studentId, setStudentId] =
    useState("");

  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  // ==========================================
  // Demo Login
  // ==========================================
  function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const user = DEMO_USERS.find(
      (item) =>
        item.email === email.trim() &&
        item.password === password
    );

    if (!user) {
      setError(
        "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      );

      setLoading(false);

      return;
    }

    // ล้าง Google Account เดิม
    localStorage.removeItem("google_id");
    localStorage.removeItem("name");
    localStorage.removeItem("picture");

    // บันทึกข้อมูลผู้ใช้
    localStorage.setItem(
      "role",
      user.role
    );

    localStorage.setItem(
      "student_id",
      user.student_id
    );

    localStorage.setItem(
      "year",
      String(user.year)
    );

    localStorage.setItem(
      "major",
      user.major
    );

    localStorage.setItem(
      "email",
      user.email
    );

    if (user.role === "teacher") {
      router.push("/teacher");
    } else {
      router.push("/student");
    }
  }

  // ==========================================
  // ฟังก์ชันผูก Google กับรหัสนักศึกษา
  // ==========================================
  async function handleLinkStudent(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const cleanStudentId =
      studentId.trim();

    // ==================================
    // ตรวจรหัสเบื้องต้น
    // ==================================
    if (!cleanStudentId) {
      setError(
        "กรุณากรอกรหัสนักศึกษา"
      );

      return;
    }

    if (!/^\d+$/.test(cleanStudentId)) {
      setError(
        "รหัสนักศึกษาต้องเป็นตัวเลข"
      );

      return;
    }

    if (!googleUser?.credential) {
      setError(
        "ไม่พบ Google Credential กรุณาเข้าสู่ระบบใหม่"
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "========== LINK STUDENT =========="
      );

      console.log(
        "Student ID:",
        cleanStudentId
      );

      console.log(
        "API:",
        `${API_URL}/api/auth/google/link-student`
      );

      // ==================================
      // ส่งข้อมูลไป Backend
      // ==================================
      const result = await fetch(
        `${API_URL}/api/auth/google/link-student`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            credential:
              googleUser.credential,

            student_id:
              cleanStudentId,
          }),
        }
      );

      console.log(
        "Link Student Status:",
        result.status
      );

      const rawText =
        await result.text();

      console.log(
        "Link Student Response:",
        rawText
      );

      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Backend ส่งข้อมูลไม่ใช่ JSON: ${rawText}`
        );
      }

      // ==================================
      // Backend Error
      // ==================================
      if (!result.ok) {
        throw new Error(
          data.detail ||
            "ไม่สามารถผูกบัญชีกับรหัสนักศึกษาได้"
        );
      }

      // ==================================
      // ตรวจข้อมูล User
      // ==================================
      if (!data.user) {
        throw new Error(
          "Backend ไม่ได้ส่งข้อมูลนักศึกษากลับมา"
        );
      }

      const user = data.user;

      console.log(
        "========== LINK STUDENT SUCCESS =========="
      );

      console.log(
        "User:",
        user
      );

      // ==================================
      // บันทึกข้อมูลลง LocalStorage
      // ==================================
      localStorage.setItem(
        "google_id",
        user.google_id || ""
      );

      localStorage.setItem(
        "email",
        user.email || ""
      );

      localStorage.setItem(
        "name",
        user.name || ""
      );

      localStorage.setItem(
        "picture",
        user.picture || ""
      );

      localStorage.setItem(
        "role",
        user.role || "student"
      );

      localStorage.setItem(
        "student_id",
        user.student_id || ""
      );

      localStorage.setItem(
        "year",
        user.year !== null &&
          user.year !== undefined
          ? String(user.year)
          : ""
      );

      localStorage.setItem(
        "major",
        user.major || ""
      );

      console.log(
        "========== LOCAL STORAGE =========="
      );

      console.log(
        "student_id:",
        localStorage.getItem(
          "student_id"
        )
      );

      console.log(
        "year:",
        localStorage.getItem("year")
      );

      console.log(
        "major:",
        localStorage.getItem("major")
      );

      console.log(
        "==================================="
      );

      // ==================================
      // ปิดหน้าผูกบัญชี
      // ==================================
      setShowLinkStudent(false);

      setGoogleUser(null);

      setStudentId("");

      // ==================================
      // เข้า Dashboard
      // ==================================
      router.push("/student");
    } catch (err) {
      console.log(
        "========== LINK STUDENT ERROR =========="
      );

      console.log(
        err
      );

      console.log(
        err instanceof Error
          ? err.message
          : String(err)
      );

      console.log(
        "========================================="
      );

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถผูกบัญชีได้"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // Google Login
  // ==========================================
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.log(
        "GOOGLE ERROR: NEXT_PUBLIC_GOOGLE_CLIENT_ID ไม่มีค่า"
      );

      setError(
        "ไม่พบ Google Client ID"
      );

      return;
    }

    const initializeGoogle = () => {
      if (
        !window.google ||
        !googleButtonRef.current
      ) {
        console.log(
          "GOOGLE ERROR: Google Identity Services ยังไม่พร้อม"
        );

        return;
      }

      console.log(
        "========== GOOGLE INITIALIZE =========="
      );

      console.log(
        "Google Client ID:",
        GOOGLE_CLIENT_ID
      );

      console.log(
        "API URL:",
        API_URL
      );

      console.log(
        "======================================="
      );

      window.google.accounts.id.initialize({
        client_id:
          GOOGLE_CLIENT_ID,

        callback: async (
          response: any
        ) => {
          try {
            setError("");

            setLoading(true);

            console.log(
              "========== GOOGLE LOGIN CALLBACK =========="
            );

            console.log(
              "Credential exists:",
              !!response?.credential
            );

            if (
              !response?.credential
            ) {
              throw new Error(
                "ไม่พบ Google Credential"
              );
            }

            // ==================================
            // ส่ง Google Token ไป Backend
            // ==================================
            const result =
              await fetch(
                `${API_URL}/api/auth/google`,
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    credential:
                      response.credential,
                  }),
                }
              );

            console.log(
              "Google API Status:",
              result.status
            );

            const rawText =
              await result.text();

            console.log(
              "Google API Response:",
              rawText
            );

            let data: any = {};

            try {
              data =
                JSON.parse(
                  rawText
                );
            } catch {
              throw new Error(
                `Backend ส่งข้อมูลไม่ใช่ JSON: ${rawText}`
              );
            }

            // ==================================
            // Backend Error
            // ==================================
            if (!result.ok) {
              throw new Error(
                data.detail ||
                  "เข้าสู่ระบบด้วย Google ไม่สำเร็จ"
              );
            }

            // ==================================
            // ตรวจ User
            // ==================================
            if (!data.user) {
              throw new Error(
                "Backend ไม่ได้ส่งข้อมูล user กลับมา"
              );
            }

            const user =
              data.user;

            console.log(
              "========== GOOGLE LOGIN SUCCESS =========="
            );

            console.log(
              "User:",
              user
            );

            // ==================================
            // กรณีมี Student อยู่แล้ว
            // ==================================
            if (
              user.student_id
            ) {
              console.log(
                "พบ Student ID เดิม:",
                user.student_id
              );

              // ==================================
              // บันทึกข้อมูล
              // ==================================
              localStorage.setItem(
                "google_id",
                user.google_id ||
                  ""
              );

              localStorage.setItem(
                "email",
                user.email ||
                  ""
              );

              localStorage.setItem(
                "name",
                user.name ||
                  ""
              );

              localStorage.setItem(
                "picture",
                user.picture ||
                  ""
              );

              localStorage.setItem(
                "role",
                user.role ||
                  "student"
              );

              localStorage.setItem(
                "student_id",
                user.student_id
              );

              localStorage.setItem(
                "year",
                user.year !==
                  null &&
                  user.year !==
                    undefined
                  ? String(
                      user.year
                    )
                  : ""
              );

              localStorage.setItem(
                "major",
                user.major ||
                  ""
              );

              console.log(
                "ข้อมูลนักศึกษาถูกบันทึกแล้ว"
              );

              // ==================================
              // เข้า Dashboard
              // ==================================
              if (
                user.role ===
                "teacher"
              ) {
                router.push(
                  "/teacher"
                );
              } else {
                router.push(
                  "/student"
                );
              }

              return;
            }

            // ==================================
            // กรณียังไม่มี Student ID
            // ==================================
            console.log(
              "Google Account ยังไม่ได้ผูกกับ Student"
            );

            // เก็บ Credential ไว้ชั่วคราว
            // เพื่อใช้ตอนกดผูกบัญชี
            setGoogleUser({
              ...user,
              credential:
                response.credential,
            });

            // แสดงหน้ากรอกรหัสนักศึกษา
            setShowLinkStudent(true);

            // ไม่เข้า Dashboard
          } catch (err) {
            console.log(
              "========== GOOGLE LOGIN ERROR =========="
            );

            console.log(
              "ERROR OBJECT:",
              err
            );

            console.log(
              "ERROR MESSAGE:",
              err instanceof Error
                ? err.message
                : String(err)
            );

            console.log(
              "========================================="
            );

            setError(
              err instanceof Error
                ? err.message
                : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ"
            );
          } finally {
            setLoading(false);
          }
        },
      });

      // ==================================
      // Render Google Button
      // ==================================
      googleButtonRef.current.innerHTML =
        "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 400,
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );

      console.log(
        "Google Login Button Rendered"
      );
    };

    // ==================================
    // Google Script โหลดแล้ว
    // ==================================
    if (window.google) {
      initializeGoogle();

      return;
    }

    // ==================================
    // โหลด Google Identity Services
    // ==================================
    const script =
      document.createElement(
        "script"
      );

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload =
      initializeGoogle;

    script.onerror = () => {
      console.log(
        "GOOGLE ERROR: โหลด Google Identity Services ไม่สำเร็จ"
      );

      setError(
        "ไม่สามารถโหลด Google Login ได้"
      );
    };

    document.head.appendChild(
      script
    );

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [
    GOOGLE_CLIENT_ID,
    API_URL,
    router,
  ]);

  // ==========================================
  // ถ้ากำลังผูกบัญชี
  // ==========================================
  if (showLinkStudent) {
    return (
      <main className="min-h-screen bg-[#eef5fb] flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <div className="rounded-2xl border border-[#dbe7f2] bg-white p-7 shadow-sm">

            <div className="text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M5 20C5.8 16.5 8.2 14.5 12 14.5C15.8 14.5 18.2 16.5 19 20"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-[#17365d]">
                ผูกบัญชีนักศึกษา
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                บัญชี Google นี้ยังไม่ได้ผูกกับรหัสนักศึกษา
              </p>

              {googleUser?.email && (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {googleUser.email}
                </div>
              )}

            </div>

            <form
              onSubmit={
                handleLinkStudent
              }
              className="mt-6"
            >

              <label className="mb-2 block text-sm font-medium text-[#17365d]">
                รหัสนักศึกษา
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={studentId}
                onChange={(e) =>
                  setStudentId(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="กรอกรหัสนักศึกษา"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                disabled={loading}
                autoFocus
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !studentId.trim()
                }
                className="mt-5 w-full rounded-xl bg-[#1264d8] py-3.5 font-semibold text-white transition hover:bg-[#0d56bd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "กำลังผูกบัญชี..."
                  : "ผูกบัญชีและเข้าสู่ระบบ"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowLinkStudent(
                    false
                  );

                  setGoogleUser(
                    null
                  );

                  setStudentId("");

                  setError("");
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-3.5 font-medium text-slate-600 transition hover:bg-slate-50"
              >
                ยกเลิก
              </button>

            </form>

          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // Login UI
  // ==========================================
  return (
    <main className="min-h-screen bg-[#eef5fb]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ==================================
            Left Section
        ================================== */}
        <div className="hidden bg-[#0d3b70] lg:flex lg:flex-col lg:justify-center lg:px-20">

          <div className="max-w-xl text-white">

            <h1 className="text-4xl font-bold leading-tight">
              ระบบเสนอและวิเคราะห์
              <br />
              ความต้องการรายวิชาเสรี
            </h1>

            <p className="mt-5 text-lg leading-8 text-blue-100">
              ระบบสำหรับรวบรวมความต้องการรายวิชาเสรี
              ของนักศึกษา และวิเคราะห์ข้อมูลด้วย
              NLP, TF-IDF และ KNN
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">

              <div className="rounded-xl bg-white/10 p-4">
                <div className="text-2xl font-bold">
                  01
                </div>

                <p className="mt-2 text-sm">
                  เสนอรายวิชา IN403103
                  Artificial Intelligence
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <div className="text-2xl font-bold">
                  02
                </div>

                <p className="mt-2 text-sm">
                  NLP + TF-IDF + KNN
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <div className="text-2xl font-bold">
                  03
                </div>

                <p className="mt-2 text-sm">
                  วิเคราะห์ข้อมูล
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ==================================
            Right Section
        ================================== */}
        <div className="flex items-center justify-center p-6">

          <div className="w-full max-w-md">

            <div className="mb-8 text-center lg:text-left">

              <h2 className="text-3xl font-bold text-[#17365d]">
                ยินดีต้อนรับ
              </h2>

              <p className="mt-2 text-slate-500">
                เข้าสู่ระบบเสนอและวิเคราะห์รายวิชาเสรี
              </p>

            </div>

            <form
              onSubmit={handleLogin}
              className="rounded-2xl border border-[#dbe7f2] bg-white p-7 shadow-sm"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-[#17365d]">
                  อีเมล
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="กรอกอีเมล"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* Password */}
              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-[#17365d]">
                  รหัสผ่าน
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-[#1264d8] py-3.5 font-semibold text-white transition hover:bg-[#0d56bd] disabled:opacity-60"
              >
                {loading
                  ? "กำลังเข้าสู่ระบบ..."
                  : "เข้าสู่ระบบ"}
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  หรือ
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* Google Login */}
              <div className="flex justify-center">

                <div
                  ref={
                    googleButtonRef
                  }
                />

              </div>

              {/* Demo Accounts */}
              <div className="mt-6 rounded-xl bg-[#f5f9ff] p-4 text-sm text-slate-500">

                <p className="font-semibold text-[#17365d]">
                  บัญชีสำหรับทดสอบ
                </p>

                <p className="mt-2">
                  นักศึกษา: student1@demo.com
                </p>

                <p>
                  รหัสผ่าน: 123456
                </p>

                <p className="mt-2">
                  อาจารย์: teacher@demo.com
                </p>

                <p>
                  รหัสผ่าน: 123456
                </p>

              </div>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}