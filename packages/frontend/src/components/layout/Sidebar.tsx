import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Financial', path: '/financial' },
  { label: 'CFO Assistant', path: '/cfo-assistant' },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-gray-900 text-white transition-transform duration-300 z-50 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">CFO AI</h1>
          <p className="text-gray-400 text-sm">Virtual CFO</p>
        </div>

        <nav className="space-y-2 px-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded transition ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
