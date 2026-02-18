import { useEffect, useState, ChangeEvent, useRef } from "react";
import { Search, Phone, Upload, Download, Filter, Edit3, Trash2, Calendar, Users } from "lucide-react";
import * as XLSX from "xlsx";

type Lead = {
  id: number;
  name: string;
  phone: string;
  status: "New" | "Contacted" | "Qualified" | "Unqualified";
  assignedTo: string;
  lastContact: string;
  notes: string;
};

const statusBadgeColors: Record<Lead["status"], string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-amber-100 text-amber-700 border-amber-200",
  Qualified: "bg-green-100 text-green-700 border-green-200",
  Unqualified: "bg-red-100 text-red-700 border-red-200",
};

export default function ModernLeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      name: "John Smith",
      phone: "+1-555-0123",
      status: "New",
      assignedTo: "Alice Johnson",
      lastContact: "2025-01-15",
      notes: "Interested in premium package"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      phone: "+1-555-0456",
      status: "Contacted",
      assignedTo: "Bob Davis",
      lastContact: "2025-01-20",
      notes: "Requested callback next week"
    },
    {
      id: 3,
      name: "Mike Brown",
      phone: "+1-555-0789",
      status: "Qualified",
      assignedTo: "Alice Johnson",
      lastContact: "2025-01-22",
      notes: "Ready to purchase, budget confirmed"
    },
    {
      id: 4,
      name: "Emma Davis",
      phone: "+1-555-0321",
      status: "Unqualified",
      assignedTo: "Charlie Wilson",
      lastContact: "2025-01-18",
      notes: "Not interested at this time"
    }
  ]);
  
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [assignedFilter, setAssignedFilter] = useState<string>("All");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const editInitialFocus = useRef<HTMLInputElement>(null);
  
  // Get unique assigned users
  const assignedUsers = Array.from(new Set(leads.map(lead => lead.assignedTo)));

  // Filter leads based on search and filters
  useEffect(() => {
    let filtered = leads;
    
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "All") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    if (assignedFilter !== "All") {
      filtered = filtered.filter(lead => lead.assignedTo === assignedFilter);
    }
    
    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, assignedFilter]);

  // Handle file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setUploadError("Please upload a valid Excel (.xlsx or .xls) file.");
      return;
    }
    
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newLeads: Lead[] = [
        {
          id: Date.now(),
          name: "Uploaded Lead",
          phone: "+1-555-9999",
          status: "New",
          assignedTo: "System",
          lastContact: new Date().toISOString().split('T')[0],
          notes: "Uploaded from Excel"
        }
      ];
      
      setLeads(prev => [...prev, ...newLeads]);
      setSuccessMsg(`${newLeads.length} leads uploaded successfully.`);
      setUploading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 2000);
  };

  // Update lead status
  const updateLeadStatus = (leadId: number, newStatus: Lead["status"]) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, lastContact: new Date().toISOString().split('T')[0] }
        : lead
    ));
  };

  // Delete lead
  const deleteLead = (leadId: number) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  };

  // Stats calculation
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "New").length,
    contacted: leads.filter(l => l.status === "Contacted").length,
    qualified: leads.filter(l => l.status === "Qualified").length,
    unqualified: leads.filter(l => l.status === "Unqualified").length,
  };

  // Export leads to Excel
  const exportLeadsToExcel = () => {
    const worksheetData = leads.map(lead => ({
      Name: lead.name,
      Phone: lead.phone,
      Status: lead.status,
      "Assigned To": lead.assignedTo,
      "Last Contact": lead.lastContact,
      Notes: lead.notes,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "lead-upload-template.xlsx");
  };

  // Simulate call action
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  // Open edit modal
  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setEditForm({ ...lead });
    setTimeout(() => editInitialFocus.current?.focus(), 100);
  };

  // Save edit
  const handleEditSave = () => {
    if (!editLead) return;
    setLeads(prev =>
      prev.map(l =>
        l.id === editLead.id
          ? { ...l, ...editForm, lastContact: new Date().toISOString().split('T')[0] }
          : l
      )
    );
    setEditLead(null);
  };

  // Cancel edit
  const handleEditCancel = () => {
    setEditLead(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
                <p className="text-sm text-gray-600">Telecalling Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportLeadsToExcel}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Contacted</p>
                <p className="text-2xl font-bold text-amber-600">{stats.contacted}</p>
              </div>
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Qualified</p>
                <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Unqualified</p>
                <p className="text-2xl font-bold text-red-600">{stats.unqualified}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Upload className="h-5 w-5 text-gray-600" />
              <span>Bulk Upload</span>
            </h2>
            <div className="flex items-center space-x-2">
              {/* <a
                href="/lead-upload-template.xlsx"
                download
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </a> */}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  exportLeadsToExcel();
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Download Template (Current Data)</span>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Excel File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {uploading && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-end">
              {uploadError && (
                <div className="text-red-600 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  {uploadError}
                </div>
              )}
              {successMsg && (
                <div className="text-green-600 text-sm font-medium bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  {successMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Unqualified">Unqualified</option>
              </select>
            </div>
            
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Agents</option>
                {assignedUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-center items-center text-sm text-gray-600">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Information
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead["status"])}
                        className={`text-xs font-medium px-3 py-1 rounded-full border ${statusBadgeColors[lead.status]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.assignedTo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{lead.lastContact}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {lead.notes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => handleCall(lead.phone)}
                          title="Call Lead"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => handleEdit(lead)}
                          title="Edit Lead"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {editLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-lg font-bold mb-4">Edit Lead</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEditSave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  ref={editInitialFocus}
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editForm.name || ""}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editForm.phone || ""}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editForm.status || "New"}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Lead["status"] }))}
                  required
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editForm.assignedTo || ""}
                  onChange={e => setEditForm(f => ({ ...f, assignedTo: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Contact</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editForm.lastContact || ""}
                  onChange={e => setEditForm(f => ({ ...f, lastContact: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={editForm.notes || ""}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleEditCancel}
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}