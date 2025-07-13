'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function BulkEmailPage() {
  const [emails, setEmails] = useState([]);
  const [manualEmail, setManualEmail] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [senderName, setSenderName] = useState('');
  const [subject, setSubject] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (res) => {
          const list = res.data.flat().map((e) => e.toString().trim());
          setEmails([...new Set([...emails, ...list])]);
        }
      });
    } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      workbook.SheetNames.forEach((s) => {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[s], { header: 1 });
        rows.flat().forEach((e) => {
          if (e) setEmails((prev) => [...new Set([...prev, e.toString().trim()])]);
        });
      });
    } else {
      toast.error('Unsupported file type. Upload .csv or .xlsx');
    }
  };

  const handleSendEmails = async () => {
    if (!emailBody || !senderName || !subject || emails.length === 0) {
      return toast.error('Please complete all fields before sending.');
    }

    toast.loading('Sending emails...', { id: 'sending' });

    try {
      await axios.post('/api/send-bulk', {
        name: senderName,
        subject,
        body: emailBody,
        emails
      });

      toast.success('✅ Emails sent successfully!', { id: 'sending' });
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to send emails', { id: 'sending' });
    }
  };

  return (
   <main className="p-6 max-w-3xl mx-auto text-black dark:text-white bg-white dark:bg-[#111] rounded-lg shadow-md">
  <h1 className="text-3xl font-bold mb-6 text-center">📤 Bulk Email Sender</h1>

  {/* File Upload */}
  <section className="mb-6">
    <label className="block text-sm font-medium mb-2">📎 Upload Recipients (.csv, .xlsx):</label>
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".csv,.xls,.xlsx"
        onChange={(e) => {
          handleFileUpload(e);
          if (e.target.files.length > 0) {
            toast.success(`📁 ${e.target.files[0].name} loaded`);
          }
        }}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-white dark:bg-[#2a2a2a] dark:text-gray-200 dark:border-gray-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  </section>

  {/* Manual Email Add */}
  <section className="mb-6">
    <label className="block text-sm font-medium mb-2">➕ Add Email Manually:</label>
    <div className="flex gap-2">
      <input
        type="email"
        placeholder="Enter email address"
        value={manualEmail}
        onChange={(e) => setManualEmail(e.target.value)}
        className="p-2 border rounded w-full dark:bg-[#222]"
      />
      <button
        onClick={() => {
          if (manualEmail && !emails.includes(manualEmail)) {
            setEmails([...emails, manualEmail.trim()]);
            setManualEmail('');
          }
        }}
        className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
      >
        Add
      </button>
    </div>
  </section>

  {/* Email List Preview */}
  {emails.length > 0 && (
    <section className="mb-6">
      <h2 className="font-semibold mb-2">📬 Recipient List ({emails.length}):</h2>
      <ul className="bg-gray-100 dark:bg-[#1c1c1c] p-4 rounded space-y-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-700">
        {emails.map((email, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-1"
          >
            <span>{email}</span>
            <button
              className="text-red-500 text-sm"
              onClick={() => setEmails(emails.filter((_, i) => i !== idx))}
            >
              🗑️ Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  )}

  {/* Email Content */}
  <section className="mb-6 space-y-4">
    <input
      type="text"
      placeholder="✉️ Sender name (e.g. ColdReach)"
      value={senderName}
      onChange={(e) => setSenderName(e.target.value)}
      className="p-2 border rounded w-full dark:bg-[#222]"
    />

    <input
      type="text"
      placeholder="📌 Email Subject"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
      className="p-2 border rounded w-full dark:bg-[#222]"
    />

    <textarea
      rows={6}
      placeholder="📝 Email Body"
      value={emailBody}
      onChange={(e) => setEmailBody(e.target.value)}
      className="p-2 border rounded w-full dark:bg-[#222]"
    ></textarea>
  </section>

  {/* Send Button */}
  <button
    onClick={handleSendEmails}
    className={`w-full py-3 font-semibold rounded text-white transition ${
      emails.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
    }`}
    disabled={emails.length === 0}
  >
    🚀 Send to {emails.length} recipient{emails.length !== 1 && 's'}
  </button>
</main>
  )
}