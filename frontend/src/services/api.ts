const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || response.statusText || 'An error occurred';
    const err: any = new Error(errorMsg);
    err.code = json.error?.code || 'UNKNOWN_ERROR';
    err.status = response.status;
    err.details = json.error?.details;
    throw err;
  }

  return json.data;
}

export const api = {
  // Auth
  signup: (data: { email: string; password: string; name: string; phone: string }) =>
    apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  sendVerificationOtp: (email?: string) =>
    apiRequest('/auth/send-verification-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyEmail: (otp: string, email?: string) =>
    apiRequest('/auth/verify-email', { method: 'POST', body: JSON.stringify({ otp, email }) }),
  resendVerificationOtp: (email?: string) =>
    apiRequest('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),

  // Business
  setupBusiness: (data: any) => apiRequest('/business/setup', { method: 'POST', body: JSON.stringify(data) }),
  getCategories: () => apiRequest('/business/categories'),
  getMyBusinesses: () => apiRequest('/business/my'),
  getBusiness: (id: string) => apiRequest(`/business/${id}`),
  updateBusiness: (id: string, data: any) => apiRequest(`/business/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getQuestions: (id: string) => apiRequest(`/business/${id}/questions`),
  saveQuestions: (id: string, questions: any[]) => apiRequest(`/business/${id}/questions`, { method: 'PUT', body: JSON.stringify({ questions }) }),
  getSettings: (id: string) => apiRequest(`/business/${id}/settings`),
  saveSettings: (id: string, data: any) => apiRequest(`/business/${id}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
  getUsage: (id: string) => apiRequest(`/business/${id}/usage`),
  getReviews: (id: string, params?: { sentiment?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/business/${id}/reviews${query ? `?${query}` : ''}`);
  },
  getAnalytics: (id: string) => apiRequest(`/business/${id}/analytics`),
  getBusinessNotifications: (businessId: string) => apiRequest(`/business/${businessId}/notifications`),
  submitSoftwareInquiry: (businessId: string, data: { serviceType: string; requirements?: string; contactPhone: string }) =>
    apiRequest(`/business/${businessId}/custom-software-inquiry`, { method: 'POST', body: JSON.stringify(data) }),


  // QR Codes
  getQRs: (businessId: string) => apiRequest(`/qrs/business/${businessId}/qrs`),
  createQR: (businessId: string, name: string, locationTag: string) =>
    apiRequest(`/qrs/business/${businessId}/qrs`, { method: 'POST', body: JSON.stringify({ name, locationTag }) }),
  toggleQR: (businessId: string, qrId: string, updates: any) =>
    apiRequest(`/qrs/business/${businessId}/qrs/${qrId}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  // Customer (Anonymous)
  getCustomerQR: (slug: string) => apiRequest(`/customer/qr/${slug}`),
  generateReview: (data: {
    sessionToken: string;
    ratings: Record<string, number>;
    customerComment?: string;
    dishesTried?: string[];
    reviewLength?: 'short' | 'medium' | 'detailed';
  }) => apiRequest('/customer/generate', { method: 'POST', body: JSON.stringify(data) }),
  markCopied: (reviewId: string) => apiRequest('/customer/copied', { method: 'POST', body: JSON.stringify({ reviewId }) }),
  markGoogleClick: (reviewId: string) => apiRequest('/customer/google-click', { method: 'POST', body: JSON.stringify({ reviewId }) }),

  // Payments & Plans
  getPlans: () => apiRequest('/payment/plans'),
  createOrder: (businessId: string, planId: string) =>
    apiRequest('/payment/create-order', {
      method: 'POST',
      headers: { 'X-Business-ID': businessId },
      body: JSON.stringify({ planId }),
    }),
  verifyPayment: (businessId: string, data: { orderId: string; paymentId: string; signature: string }) =>
    apiRequest('/payment/verify', {
      method: 'POST',
      headers: { 'X-Business-ID': businessId },
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminBusinesses: () => apiRequest('/admin/businesses'),
  createBusinessManual: (data: any) =>
    apiRequest('/admin/businesses', { method: 'POST', body: JSON.stringify(data) }),
  updateBusinessLimit: (id: string, customLimit: number) =>
    apiRequest(`/admin/businesses/${id}/limit`, { method: 'PATCH', body: JSON.stringify({ customLimit }) }),
  updatePaymentStatus: (id: string, status: string) =>
    apiRequest(`/admin/businesses/${id}/payment-status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  addContactLog: (id: string, note: string) =>
    apiRequest(`/admin/businesses/${id}/contact-log`, { method: 'POST', body: JSON.stringify({ note }) }),
  toggleBusinessStatus: (id: string, isActive: boolean) =>
    apiRequest(`/admin/businesses/${id}/toggle-status`, { method: 'POST', body: JSON.stringify({ isActive }) }),
  getAdminPlans: () => apiRequest('/admin/plans'),
  updatePlan: (id: string, updates: any) => apiRequest(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  getAuditLogs: () => apiRequest('/admin/audit-logs'),
  getAdminNotifications: () => apiRequest('/admin/notifications'),
  createAdminNotification: (data: { title: string; message: string; type: string; targetBusinessId?: string }) =>
    apiRequest('/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminNotification: (id: string) => apiRequest(`/admin/notifications/${id}`, { method: 'DELETE' }),
  getAdminInquiries: () => apiRequest('/admin/inquiries'),
  updateInquiryStatus: (id: string, status: string) =>
    apiRequest(`/admin/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Blog & Articles
  getAdminBlogs: (search?: string) =>
    apiRequest(`/admin/blogs${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createAdminBlog: (data: any) =>
    apiRequest('/admin/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminBlog: (id: string, data: any) =>
    apiRequest(`/admin/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminBlog: (id: string) =>
    apiRequest(`/admin/blogs/${id}`, { method: 'DELETE' }),
  getPublicBlogs: (search?: string) =>
    apiRequest(`/blogs${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getPublicBlogBySlug: (slug: string) =>
    apiRequest(`/blogs/${slug}`),
};
