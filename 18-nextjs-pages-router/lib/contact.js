// Demo mode: client-side replacement for the former /api/contact route.
// Validates like the API did, then stores the message in localStorage.
const STORAGE_KEY = '18-nextjs-pages-router:contact-messages';

export async function sendContactMessage(contactData) {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 500));

  const { fullName, email, subject, message } = contactData ?? {};

  if (!fullName || !email || !subject || !message)
    return {
      success: false,
      message: 'Could not send your message. Please try again',
    };

  try {
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    messages.push({ ...contactData, createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    return {
      success: false,
      message: 'Could not send your message. Please try again',
    };
  }

  // Success message
  return {
    success: true,
    message: 'Thanks for your message! We will be in touch soon :)',
  };
}
