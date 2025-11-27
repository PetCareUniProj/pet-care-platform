'use client';

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const TopBar: React.FC = () => {
    return (
        <div className="w-full py-6 bg-gray-50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-6">
                <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">+379 871-8371</span>
                </div>

                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">rgarton@outlook.com</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">8592 Fairground St. Tallahassee, FL 32303</span>
            </div>
        </div>
    );
};

export default TopBar;
