function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200',
    secondary: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    danger: 'bg-white text-red-500 border border-slate-200 hover:bg-red-50 hover:border-red-200',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;