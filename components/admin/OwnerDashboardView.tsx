'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Headphones, FileText, ListMusic, AlertTriangle, Activity, Lock, CheckCircle, XCircle } from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/ui/States';

interface OwnerDashboardViewProps {
  currentUser: any;
}

export function OwnerDashboardView({ currentUser }: OwnerDashboardViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'users' | 'reports' | 'audit'>('stats');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, reportsRes, auditRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/audit-logs'),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const reportsData = await reportsRes.json();
      const auditData = await auditRes.json();

      if (statsRes.ok) setStats(statsData.stats);
      if (usersRes.ok) setUsers(usersData.users || []);
      if (reportsRes.ok) setReports(reportsData.reports || []);
      if (auditRes.ok) setAuditLogs(auditData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (isMounted) {
        await fetchDashboardData();
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    if (currentUser?.role !== 'OWNER') {
      alert('Only the Owner can assign privileged roles.');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update role.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string, status: string, removeContent: boolean) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, removeContent }),
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser || (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN' && currentUser.role !== 'MODERATOR')) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <h3 className="font-bold text-lg text-neutral-950 mb-2">Access Denied</h3>
        <p className="text-xs text-neutral-500">You do not have administrative permissions to view this dashboard.</p>
      </div>
    );
  }

  if (loading && !stats) return <LoadingState message="Loading Owner Dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 text-white text-xs font-medium mb-3">
            <Shield className="w-3.5 h-3.5" /> Owner & Moderator Dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Platform Administration</h1>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
          {(['stats', 'users', 'reports', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${activeSubTab === tab ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-600 hover:text-neutral-950'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'stats' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium uppercase">Total Users</span>
                <Users className="w-5 h-5 text-neutral-950" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-950">{stats.totalUsers}</h2>
              <p className="text-xs text-emerald-600 mt-1">{stats.activeUsers} active accounts</p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium uppercase">Audio Tracks</span>
                <Headphones className="w-5 h-5 text-neutral-950" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-950">{stats.tracksCount}</h2>
              <p className="text-xs text-neutral-400 mt-1">Stored securely in object storage</p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium uppercase">Posts & Reels</span>
                <FileText className="w-5 h-5 text-neutral-950" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-950">{stats.postsCount}</h2>
              <p className="text-xs text-neutral-400 mt-1">{stats.reelsCount} music reels active</p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium uppercase">Pending Reports</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-950">{stats.reportsCount}</h2>
              <p className="text-xs text-amber-600 mt-1">Requires moderation review</p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-semibold text-base text-neutral-950">User Accounts & Role Management</h3>
              <span className="text-xs text-neutral-400">Showing recent accounts</span>
            </div>
            <div className="divide-y divide-neutral-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50">
                      <td className="px-6 py-4 font-semibold text-neutral-950">{u.name || 'User'}</td>
                      <td className="px-6 py-4 text-neutral-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role}
                          disabled={currentUser.role !== 'OWNER'}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="bg-neutral-100 border border-neutral-300 rounded-lg px-2 py-1 text-xs font-medium disabled:opacity-60"
                        >
                          <option value="USER">USER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="OWNER">OWNER</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {u.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => handleUpdateUserStatus(u.id, 'SUSPENDED')}
                            className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateUserStatus(u.id, 'ACTIVE')}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium"
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((r: any) => (
              <div key={r.id} className="p-6 rounded-2xl border border-neutral-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 uppercase">
                      {r.targetType} Report
                    </span>
                    <span className="text-xs text-neutral-400">Status: {r.status}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-neutral-950">Reason: {r.reason}</h4>
                  <p className="text-xs text-neutral-500 mt-1">Reported by {r.reporter?.name || r.reporter?.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleResolveReport(r.id, 'DISMISSED', false)}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-200"
                  >
                    Dismiss
                  </button>
                  <button 
                    onClick={() => handleResolveReport(r.id, 'RESOLVED', true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700"
                  >
                    Remove Content & Resolve
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No pending reports" description="All user reports have been resolved." />
          )}
        </div>
      )}

      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <h3 className="font-semibold text-base text-neutral-950">Administrative Audit Logs</h3>
          </div>
          <div className="divide-y divide-neutral-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Admin</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-semibold text-neutral-950">{log.admin?.name || log.admin?.email}</td>
                    <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                    <td className="px-6 py-4 text-neutral-500 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                    <td className="px-6 py-4 text-neutral-400">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
