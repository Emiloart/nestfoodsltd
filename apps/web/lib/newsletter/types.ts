export type NewsletterSubscriber = {
  id: string;
  email: string;
  fullName?: string;
  source?: string;
  consentMarketing: boolean;
  createdAt: string;
};

export type NewsletterData = {
  subscribers: NewsletterSubscriber[];
};
