"use client";

import { useState, useEffect } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { CSVLink } from 'react-csv';

interface Student {
  admissionNo: string;
  name: string;
  class: string;
  section: string;
}

interface LabEntry {
  id: string;
  entryTime: string;
  student: Student;
}

export default function HomePage() {
  const [entries, setEntries] = useState<LabEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ class: '', section: '', date: '' });

  const fetchEntries = async () => {
    setIsLoading(true);
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/entries?${queryParams}`);
    if (response.ok) {
      const data = await response.json();
      setEntries(data);
    } else {
      setMessage('Failed to fetch entries.');
    }
    setIsLoading(false);
  };

  const logEntry = async (admissionNo: string) => {
    setMessage('Logging entry...');
    const response = await fetch('/api/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionNo }),
    });

    if (response.ok) {
      setMessage('Entry logged successfully!');
      fetchEntries();
    } else {
      const errorData = await response.json();
      setMessage(`Error: ${errorData.error}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleScan = (result: string) => {
    if (result) {
      logEntry(result);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filters]);

  return (
    <main className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">CS Lab Entry Monitor</h1>
      {message && <div className="p-3 mb-4 text-center text-white bg-blue-500 rounded-md">{message}</div>}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Scan Student QR Code</h2>
          <div className="w-full max-w-sm mx-auto">
            <QrScanner onDecode={handleScan} onError={(error) => console.log(error?.message)} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={(e) => { e.preventDefault(); logEntry((e.target as any).admissionNo.value); (e.target as any).reset(); }} className="space-y-4">
            <input type="text" name="admissionNo" placeholder="Enter Admission Number" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
            <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Log Entry</button>
          </form>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter & Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <input type="text" placeholder="Class (e.g., 10)" value={filters.class} onChange={(e) => setFilters({...filters, class: e.target.value})} className="p-2 border rounded-md"/>
          <input type="text" placeholder="Section (e.g., A)" value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})} className="p-2 border rounded-md"/>
          <input type="date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} className="p-2 border rounded-md"/>
          <CSVLink data={entries.map(e => ({ 'Admission No': e.student.admissionNo, 'Name': e.student.name, 'Class': e.student.class, 'Section': e.student.section, 'Entry Time': new Date(e.entryTime).toLocaleString(), }))} filename={`lab-entries-${new Date().toISOString()}.csv`} className="block w-full text-center p-2 bg-green-600 text-white rounded-md hover:bg-green-700"> Export to CSV </CSVLink>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lab Entries</h2>
        {isLoading ? (<p>Loading entries...</p>) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto"><thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left">Admission No</th><th className="px-4 py-2 text-left">Name</th><th className="px-4 py-2 text-left">Class</th><th className="px-4 py-2 text-left">Section</th><th className="px-4 py-2 text-left">Entry Time</th></tr></thead><tbody>{entries.map((entry) => (<tr key={entry.id} className="border-b"><td className="px-4 py-2">{entry.student.admissionNo}</td><td className="px-4 py-2">{entry.student.name}</td><td className="px-4 py-2">{entry.student.class}</td><td className="px-4 py-2">{entry.student.section}</td><td className="px-4 py-2">{new Date(entry.entryTime).toLocaleString()}</td></tr>))}</tbody></table>
            {entries.length === 0 && !isLoading && <p className="text-center py-4">No entries found.</p>}
          </div>
        )}
      </div>
    </main>
  );
}
