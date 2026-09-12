"use client";

export function LoginBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
    >
      <div className="login-gradient absolute -left-[200px] -top-[200px] h-[800px] w-[800px] rounded-full" />
    </div>
  );
}