
type NavbarProps = {
  activePage?: 'dashboard' | 'analytics' | 'settings'
  onNavigate?: (page: 'dashboard' | 'analytics' | 'settings') => void
}

function Navbar({
  activePage = 'dashboard',
  onNavigate,
}: NavbarProps) {
  return (
    <header className="navbar">
      <a
        href="#dashboard"
        className="logo"
        onClick={() => onNavigate?.('dashboard')}
      >
        <span className="logo-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.5 3.5C11 3.5 5 7 5 13.5C5 17 7.5 19.5 11 19.5C17.5 19.5 20.5 12 19.5 3.5Z"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M4 20C8 14 12 10 19 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 13L12.5 15.5L18 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="logo-text">
          MyHabits<span>.</span>
        </span>
      </a>

      <nav>
        <a
          href="#dashboard"
          className={activePage === 'dashboard' ? 'active' : ''}
          onClick={() => onNavigate?.('dashboard')}
        >
          Dashboard
        </a>

        <a
          href="#analytics"
          className={activePage === 'analytics' ? 'active' : ''}
          onClick={() => onNavigate?.('analytics')}
        >
          Analytics
        </a>

        <a
          href="#settings"
          className={activePage === 'settings' ? 'active' : ''}
          onClick={() => onNavigate?.('settings')}
        >
          Settings
        </a>
      </nav>
    </header>
  )
}

export default Navbar
