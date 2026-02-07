export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface ScheduledEmail {
  id: string;
  recipient_email: string;
  subject: string;
  scheduled_at: string;
  status: string;
}

export interface SentEmail {
  id: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: string;
  error_message?: string;
}
