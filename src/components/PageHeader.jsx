export default function PageHeader({ title, subtitle, icon, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-600/20 dark:text-brand-400">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
