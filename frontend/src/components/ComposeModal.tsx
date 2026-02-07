import { useState } from 'react';
import { scheduleEmails } from '../api';

interface ComposeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ComposeModal({ onClose, onSuccess }: ComposeModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [emailCount, setEmailCount] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [delayBetweenEmails, setDelayBetweenEmails] = useState('5');
  const [hourlyLimit, setHourlyLimit] = useState('200');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const emails = content.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
        setEmailCount(emails.length);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('body', body);
    formData.append('file', file);
    formData.append('startTime', startTime);
    formData.append('delayBetweenEmails', delayBetweenEmails);
    formData.append('hourlyLimit', hourlyLimit);

    try {
      await scheduleEmails(formData);
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to schedule emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Compose New Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email List (CSV/TXT)</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            {emailCount > 0 && (
              <p className="mt-2 text-sm text-green-600">{emailCount} emails detected</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delay Between Emails (seconds)</label>
              <input
                type="number"
                value={delayBetweenEmails}
                onChange={(e) => setDelayBetweenEmails(e.target.value)}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Limit</label>
            <input
              type="number"
              value={hourlyLimit}
              onChange={(e) => setHourlyLimit(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Emails'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeModal;
