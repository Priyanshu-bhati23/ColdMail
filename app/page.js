'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    offer: ''
  });

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setCopied(false);

    try {
      const res = await axios.post('/api/generate', formData);
      setResult(res.data.generatedEmail);
      toast.success('✅ Email generated!');
    } catch (err) {
      console.error(err);
      setResult('❌ Failed to generate email');
      toast.error('❌ Failed to generate email');
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('📋 Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#111] dark:text-white px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">🚀 ColdReach Email Generator</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Your name or agency"
            value={formData.name}
            onChange={handleChange}
            className="p-3 border rounded bg-gray-50 dark:bg-[#222] dark:border-gray-600"
            required
          />

          <input
            type="text"
            name="target"
            placeholder="Target audience (e.g. real estate agents)"
            value={formData.target}
            onChange={handleChange}
            className="p-3 border rounded bg-gray-50 dark:bg-[#222] dark:border-gray-600"
            required
          />

          <textarea
            name="offer"
            placeholder="What do you offer?"
            value={formData.offer}
            onChange={handleChange}
            className="p-3 border rounded bg-gray-50 dark:bg-[#222] dark:border-gray-600"
            rows={4}
            required
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="bg-black dark:bg-white text-white dark:text-black font-semibold py-2 rounded hover:opacity-90 transition"
          >
             {loading && (
  <svg
      className="animate-spin h-5 w-5 text-white dark:text-black"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
  )}


            {loading ? 'Generating...' : 'Generate Email'}
          </button>
        </form>

        {result && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated Email:</h2>
              <button
                onClick={copyToClipboard}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-[#222] border rounded overflow-auto whitespace-pre-wrap">
              <pre className="text-black dark:text-white">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
