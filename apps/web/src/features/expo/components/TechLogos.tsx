type Props = {
  className?: string
}

export function LogoReact({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-700 ease-out group-hover:rotate-180 group-hover:scale-110`}
      viewBox="-11.5 -10.23174 23 20.46348"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="React"
    >
      <circle
        cx="0"
        cy="0"
        r="2.05"
        fill="#61DAFB"
        className="transition-transform duration-300 group-hover:scale-125"
      />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse
          rx="11"
          ry="4.2"
          className="transition-all duration-500 group-hover:stroke-[#7ee7ff] group-hover:stroke-[1.3]"
        />
        <ellipse
          rx="11"
          ry="4.2"
          transform="rotate(60)"
          className="transition-all duration-500 group-hover:stroke-[#7ee7ff] group-hover:stroke-[1.3]"
        />
        <ellipse
          rx="11"
          ry="4.2"
          transform="rotate(120)"
          className="transition-all duration-500 group-hover:stroke-[#7ee7ff] group-hover:stroke-[1.3]"
        />
      </g>
    </svg>
  )
}

export function LogoTypeScript({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TypeScript"
    >
      <rect
        width="32"
        height="32"
        rx="6"
        fill="#3178C6"
        className="transition-all duration-300 group-hover:fill-[#2764a8] shadow-sm"
      />
      <path
        d="M19.5 18.2c.7 1.1 1.7 1.8 3.1 1.8 1.1 0 1.9-.5 1.9-1.3 0-.9-.7-1.3-2.1-1.8l-1.1-.4c-2.1-.8-3.4-2-3.4-3.9 0-2.3 1.9-4 4.8-4 1.9 0 3.3.6 4.3 1.9l-1.6 1.4c-.6-.8-1.5-1.3-2.7-1.3-1.1 0-1.8.5-1.8 1.2 0 .8.6 1.2 1.9 1.7l1.1.4c2.4.9 3.7 2.1 3.7 4.1 0 2.5-2 4.1-5.1 4.1-2.3 0-4-1-5-2.5l1.9-1.4zM6 10h12v2.5H13v11H10.5v-11H6V10z"
        fill="#FFFFFF"
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </svg>
  )
}

export function LogoVite({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vite"
    >
      <path
        d="M29.8 6.2 16.9 29.5a1 1 0 0 1-1.8 0L2.2 6.2a1 1 0 0 1 .9-1.5h6.6a1 1 0 0 1 .9.6L16 16.2 21.4 5.3a1 1 0 0 1 .9-.6h6.6a1 1 0 0 1 .9 1.5z"
        fill="url(#vite-grad)"
        className="transition-all duration-300 group-hover:opacity-90"
      />
      <path
        d="M19.7 4.8 12.3 16l3.7.3-2.5 7.8 7.3-11.8-3.7-.3 2.6-7.2z"
        fill="#FFD62E"
        className="transition-transform duration-300 ease-out group-hover:scale-110 origin-center"
      />
      <defs>
        <linearGradient
          id="vite-grad"
          x1="2"
          y1="4.7"
          x2="28"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#41D1FF" />
          <stop offset="1" stopColor="#BD34FE" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LogoTailwind({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-115`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tailwind CSS"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6c-3.314 0-5.357 1.657-6.129 4.971 1.229-1.657 2.657-2.285 4.286-1.885 1.05.257 1.8 1.022 2.632 1.868C14.143 12.32 15.753 14 19.5 14c3.314 0 5.357-1.657 6.129-4.971-1.229 1.657-2.657 2.285-4.286 1.885-1.05-.257-1.8-1.022-2.632-1.868C17.357 7.68 15.747 6 12 6zm-7.5 8c-3.314 0-5.357 1.657-6.129 4.971 1.229-1.657 2.657-2.285 4.286-1.885 1.05.257 1.8 1.022 2.632 1.868C6.643 20.32 8.253 22 12 22c3.314 0 5.357-1.657 6.129-4.971-1.229 1.657-2.657 2.285-4.286 1.885-1.05-.257-1.8-1.022-2.632-1.868C9.857 15.68 8.247 14 4.5 14z"
        fill="#06B6D4"
        className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </svg>
  )
}

export function LogoSupabase({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-115 group-hover:rotate-12`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Supabase"
    >
      <path
        d="M13.2 1.5 3.3 13.6c-.5.6-.1 1.6.7 1.6h7.7L10.8 22.5c-.3.8.7 1.4 1.2.8l9.9-12.1c.5-.6.1-1.6-.7-1.6h-7.7l.9-7.3c.2-.8-.8-1.4-1.2-.8z"
        fill="#3ECF8E"
        className="transition-all duration-300 group-hover:fill-[#4ff5aa]"
      />
    </svg>
  )
}

export function LogoPostgres({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PostgreSQL"
    >
      <rect
        width="32"
        height="32"
        rx="6"
        fill="#336791"
        className="transition-colors duration-300 group-hover:fill-[#28557a]"
      />
      <path
        d="M22.5 11c-.9-1.6-2.9-2.7-5.5-2.7-3.6 0-6.5 2.2-7.2 5.5-.3 1.6.2 3.3.8 4.7.7 1.4 1.1 3 1.1 4.7v1.1h2.2v-1.6c0-1.9-.6-3.6-1.4-5.2-.6-1.1-.8-2.2-.6-3.3.4-2.2 2.5-3.6 5-3.6 2.2 0 3.9 1.1 4.4 2.8l1.2-2.4zm-9.4 10.5c-.8 0-1.7-.5-1.9-1.4l-1.4.5c.6 1.4 1.9 2.2 3.3 2.2s2.8-.8 3.3-2.2l-1.4-.5c-.2.9-1.1 1.4-1.9 1.4z"
        fill="#FFFFFF"
        className="transition-transform duration-300 group-hover:scale-105 origin-center"
      />
      <circle cx="14.8" cy="13.8" r="1.1" fill="#FFFFFF" />
      <circle cx="19.2" cy="13.8" r="1.1" fill="#FFFFFF" />
    </svg>
  )
}

export function LogoCloudflare({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cloudflare"
    >
      <path
        d="M18.2 12.3c-.3-.2-.7-.3-1.1-.3-.4 0-.7.1-1 .3-.3-1.9-1.9-3.3-3.9-3.3-1.7 0-3.2 1.1-3.7 2.7-.4-.3-.9-.4-1.5-.4-1.4 0-2.5 1.1-2.5 2.5 0 .3.1.6.2.8C2.9 14.8 1.5 16.5 1.5 18.5c0 2.5 2 4.5 4.5 4.5h12.5c2.2 0 4-1.8 4-4 0-1.8-1.2-3.3-2.8-3.8-.2-1.3-.7-2.3-1.5-2.9z"
        fill="#F38020"
      />
      <path
        d="M18.5 19H6c-1.7 0-3-1.3-3-3 0-1.4.9-2.5 2.2-2.9l.7-.2.2-.7c.3-1.5 1.6-2.7 3.1-2.7 1.4 0 2.6.9 3 2.3l.3.9.9-.3c.4-.1.7-.2 1.1-.2 1.4 0 2.5 1.1 2.5 2.5v.5l.5.1c1.1.2 2 1.2 2 2.3 0 1.4-1.1 2.5-2.5 2.5z"
        fill="#FAAD3F"
        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
      />
    </svg>
  )
}

export function LogoPwa({ className = 'size-6' }: Props) {
  return (
    <svg
      className={`${className} overflow-visible transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Progressive Web App"
    >
      <rect
        width="32"
        height="32"
        rx="6"
        fill="#5A0FC8"
        className="transition-colors duration-300 group-hover:fill-[#6d13f0]"
      />
      <path
        d="M7.5 21.2v-10.5h4c3 0 4.7 1.5 4.7 4 0 2.6-1.7 4.1-4.7 4.1H9.6v2.4H7.5zm1.9-4.2h2.1c1.7 0 2.7-.9 2.7-2.2 0-1.4-1-2.2-2.7-2.2H9.4v4.4zm8.6 4.2-2.2-10.5h2l1.5 7.6 1.9-7.6h2l1.9 7.6 1.5-7.6h2l-2.2 10.5h-2.1l-2-7.9-2 7.9h-2.1z"
        fill="#FFFFFF"
        className="transition-transform duration-300 group-hover:scale-105 origin-center"
      />
    </svg>
  )
}
