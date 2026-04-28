import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
