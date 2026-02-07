import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ComposeModal from '../components/ComposeModal';
import { getScheduledEmails, getSentEmails } from '../api';
import { User, ScheduledEmail, SentEmail } from '../types';

interface DashboardProps {
  user: User;
  setUser: (user: User | null) => void;
}

function Dashboard({ user, setUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [showCompose, setShowCompose] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEmails = async () => {
    setLoading(true);
    try {
      if (activeTab === 'scheduled') {
        const res = await getScheduledEmails();
        setScheduledEmails(res.data);
      } else {
        const res = await getSentEmails();
        setSentEmails(res.data);
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'scheduled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Scheduled Emails
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'sent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sent Emails
            </button>
          </div>

          <button
            onClick={() => setShowCompose(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Compose New Email
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : activeTab === 'scheduled' ? (
            scheduledEmails.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No scheduled emails</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scheduledEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{email.recipient_email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{email.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(email.scheduled_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          {email.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : sentEmails.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No sent emails</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sentEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{email.recipient_email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{email.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        email.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {email.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSuccess={loadEmails}
        />
      )}
    </div>
  );
}

export default Dashboard;
