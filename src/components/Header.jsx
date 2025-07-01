import React from 'react';

function Header() {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center h-20">
                    <h1 className="text-4xl font-semibold text-gray-900 tracking-tight font-['Fraunces'] italic">
                        <span className="text-rose-500">George's</span> Atlas
                    </h1>
                </div>
            </div>
        </header>
    );
}

export default Header;