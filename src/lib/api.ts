
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request(method: string, path: string, body?: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { data, status: res.status, ok: res.ok };
}

// ── Users ──────────────────────────────────────────────────────────────────
export const usersApi = {
    getAll: () => request('GET', '/users/'),
    getByPhone: (phone: string) => request('GET', `/users/${phone}/`),
};

// ── Student Application Status ─────────────────────────────────────────────
export const studentApplicationStatusApi = {
    getStatus: (email: string) => request('GET', `/application/status/?email=${encodeURIComponent(email)}`),
};

// ── Step Cache ─────────────────────────────────────────────────────────────
export const stepCacheApi = {
    getLastStep: (phone: string) => request('GET', `/step-cache/last/?phone=${encodeURIComponent(phone)}`),
};

// ── Step ───────────────────────────────────────────────────────────────────
export const stepApi = {
    getCache: () => request('GET', '/step-cache/all/'),
};

// ── Telecalling ────────────────────────────────────────────────────────────
export const TelecallingApi = {
    logCall: (leadId: string, payload: any) =>
        request('POST', `/telecalling/calls/log/`, { ...payload, lead_id: leadId }),
    getStats: () => request('GET', '/admin/stats/'),
};

// ── WhatsApp / Messaging ───────────────────────────────────────────────────
export const whatsappMessageApi = {
    send: (payload: { phone: string; message: string }) =>
        request('POST', '/messaging/whatsapp/send/', payload),
    getTemplates: () => request('GET', '/messaging/whatsapp/templates/'),
};

// ── Leads ──────────────────────────────────────────────────────────────────
export const leadsApi = {
    getAll: () => request('GET', '/leads/'),
    create: (data: any) => request('POST', '/leads/', data),
    update: (id: string, data: any) => request('PUT', `/leads/${id}/`, data),
    delete: (id: string) => request('DELETE', `/leads/${id}/`),
};

// ── Follow-Ups ─────────────────────────────────────────────────────────────
export const followUpsApi = {
    getAll: (params?: { status?: string; priority?: string; phone?: string }) => {
        const qs = params
            ? '?' + Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&')
            : '';
        return request('GET', `/follow-ups/${qs}`);
    },
    create: (data: {
        phone: string; name: string; email?: string; program?: string;
        campus?: string; next_follow_up?: string; priority?: string;
        status?: string; notes?: string;
    }) => request('POST', '/follow-ups/', data),
    update: (id: string, data: Partial<{
        next_follow_up: string; priority: string; status: string;
        notes: string; name: string; email: string; program: string; campus: string;
    }>) => request('PUT', `/follow-ups/?id=${id}`, data),
    delete: (id: string) => request('DELETE', `/follow-ups/?id=${id}`),
};

