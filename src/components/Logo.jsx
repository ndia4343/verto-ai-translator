export function VertoMark({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="7"
        fill="#121714"
        stroke="rgba(171, 255, 79, 0.28)"
        strokeWidth="1.25"
      />
      <path
        d="M7.5 8.5L13.2 20L16 14.5"
        stroke="#ABFF4F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 8.5L14.8 20L12 14.5"
        stroke="#3E8914"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ size = 26 }) {
  return (
    <div className="verto-logo">
      <VertoMark size={size} />
      <span className="verto-wordmark">Verto</span>
    </div>
  );
}
