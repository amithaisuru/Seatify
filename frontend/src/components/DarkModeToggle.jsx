import { useEffect, useState } from "react";

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleDarkMode}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}
        `}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300
            ${isDarkMode ? 'translate-x-6' : ''}
          `}
        >
          {isDarkMode ? (
            <span className="text-xs flex items-center justify-center h-full">🌙</span>
          ) : (
            <span className="text-xs flex items-center justify-center h-full">☀️</span>
          )}
        </div>
      </button>
    </div>
  );
}

export default DarkModeToggle;
