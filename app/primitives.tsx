import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export function AppShell({ children, className = "", style }: { children: ReactNode; className?: string; style?: HTMLAttributes<HTMLDivElement>["style"] }) {
  return <div className={`app-shell ${className}`.trim()} style={style}>{children}</div>;
}

export function PageFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`page-frame ${className}`.trim()}>{children}</main>;
}

export function TextBlock({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <header className="text-block">{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1>{children}</header>;
}

export function ImageFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`image-frame ${className}`.trim()}>{children}</div>;
}

export function ActionRow({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`action-row ${className}`.trim()} {...props}>{children}</button>;
}
