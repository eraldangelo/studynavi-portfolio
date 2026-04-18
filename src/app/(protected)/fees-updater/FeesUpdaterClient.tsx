'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/common/layout/app-header';
import { ChevronLeft, Wrench } from 'lucide-react';
import AustraliaFeesEditor from './components/AustraliaFeesEditor';
import IrelandFeesEditor from './components/IrelandFeesEditor';
import NewZealandFeesEditor from './components/NewZealandFeesEditor';
import CanadaFeesEditor from './components/CanadaFeesEditor';

const countryData = [
    { name: 'Australia', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/au.svg' },
    { name: 'Canada', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ca.svg' },
    { name: 'New Zealand', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/nz.svg' },
    { name: 'Ireland', flagUrl: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ie.svg' },
];

const FeesUpdaterClient = () => {
  const [activeTab, setActiveTab] = useState(countryData[0].name);

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4">
        <div className="pt-8 mb-6 flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                <ChevronLeft className="h-6 w-6" />
            </Link>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-primary">Fees Updater</h2>
          </div>
        </div>

        <div className="border-4 border-dashed border-gray-200 rounded-lg">
          <div className="flex space-x-4 border-b bg-white rounded-t-lg">
            {countryData.map((country) => (
              <button
                key={country.name}
                className={`px-4 py-3 text-lg font-medium flex items-center gap-2 ${activeTab === country.name ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab(country.name)}
              >
                <img src={country.flagUrl} alt={`${country.name} flag`} className="w-6 h-auto" />
                <span>{country.name}</span>
              </button>
            ))}
          </div>
          <div className="p-6 bg-white rounded-b-lg">
            {countryData.map((country) => (
              <div key={country.name} className={`${activeTab === country.name ? 'block' : 'hidden'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${country.name === 'Canada' ? 'text-red-600' : country.name === 'Ireland' ? 'text-green-600' : country.name === 'New Zealand' ? 'text-black' : 'text-green-800'}`}>{country.name} Fees</h2>
                {country.name === 'Australia' ? (
                  <AustraliaFeesEditor />
                ) : country.name === 'Ireland' ? (
                  <IrelandFeesEditor />
                ) : country.name === 'Canada' ? (
                  <CanadaFeesEditor />
                ) : country.name === 'New Zealand' ? (
                  <NewZealandFeesEditor />
                ) : (
                  <p className="text-gray-600">Content for {country.name} fees updater will go here.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeesUpdaterClient;
