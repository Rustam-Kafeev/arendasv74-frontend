export default function PlaceholderCarImage({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className || ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 150"
        className="w-24 h-24 sm:w-32 sm:h-32 text-gray-400"
        fill="currentColor"
      >
        <path d="M40 100 L30 70 L50 30 L150 30 L170 70 L160 100 Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="65" cy="105" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="135" cy="105" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="55" y="45" width="90" height="35" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="100" y="140" textAnchor="middle" fontSize="12" fill="currentColor">Нет фото</text>
      </svg>
    </div>
  );
}