import { User } from '../types';
import { logout } from '../api';

interface HeaderProps {
  user: User;
  setUser: (user: User | null) => void;
}

function Header({ user, setUser }: HeaderProps) {
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ReachInbox</h1>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
