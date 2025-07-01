import React from 'react';

function Header() {
    return (
        <header className="bg-amber-900 bg-opacity-90 text-amber-100 p-6 shadow-lg z-20 border-b-2 border-amber-800">
            <div className="max-w-4xl mx-auto relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-amber-700 -z-10"></div>
                <h1 className="text-4xl font-bold text-center font-['Fraunces'] italic tracking-wide px-4 mx-auto bg-amber-900 inline-block relative left-1/2 -translate-x-1/2">
                    <span className="text-amber-300">George's</span> Atlas
                </h1>
            </div>
            <div className="flex justify-center mt-2">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            </div>
        </header>
    );
}

export default Header;