
export interface Agent {
    _id?: string;
    id?: string;
    name: string;
    first_name?: string;
    status: string;
}

export interface StudentLead {
    _id: string;
    name: string;
    phone_number: string;
    email: string;
    program: string;
    campus: string;
    category: string;
    created_at: string;
}

export interface CallLog {
    call_duration: number;
    call_status: string;
    notes: string;
}

export interface LogCallPayload {
    agent_id: string;
    student_lead_id: string;
    call_status: string;
    call_duration: number;
    notes: string;
    call_datetime: string;
    category: string;
}
