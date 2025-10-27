import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, User, Mail, Phone, MapPin, Calendar, FileText, Eye } from "lucide-react";
import { message, Spin, Input } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import candidateAPI from "../../api/candidateAPI";
import useAuth from "../../hook/useAuth";

export default function Candidates() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const basePath = useMemo(() => {
    return user?.role === "TPNS" ? "/TPNS" : "/HR";
  }, [user]);

  // Load candidates
  useEffect(() => {
    const loadCandidates = async () => {
      console.log('[Candidates] Loading candidates with search:', searchText);
      console.log('[Candidates] Current user:', user);
      
      setLoading(true);
      try {
        const result = await candidateAPI.getCandidates({ search: searchText });
        console.log('[Candidates] Result:', result);
        
        if (result.success) {
          setCandidates(result.data || []);
        } else {
          console.error('[Candidates] Failed:', result.message);
          message.error(result.message || "Không thể tải danh sách ứng viên");
        }
      } catch (error) {
        console.error('[Candidates] Exception:', error);
        message.error("Lỗi khi tải danh sách ứng viên");
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      loadCandidates();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, user]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: candidates.length,
      withApplications: candidates.filter((c) => c.total_applications > 0).length,
      accepted: candidates.filter((c) => c.accepted_count > 0).length,
    };
  }, [candidates]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý ứng viên</h1>
            <p className="text-slate-600 mt-1">
              Danh sách tất cả ứng viên đã đăng ký trong hệ thống
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-600">Tổng ứng viên</div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-600">Đã ứng tuyển</div>
            <div className="text-2xl font-bold text-blue-900">{stats.withApplications}</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="text-sm text-green-600">Được chấp nhận</div>
            <div className="text-2xl font-bold text-green-900">{stats.accepted}</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
              size="large"
              allowClear
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              {searchText ? "Không tìm thấy ứng viên nào" : "Chưa có ứng viên nào"}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Ứng viên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Liên hệ
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                    Số hồ sơ
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                    Được chấp nhận
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                    Ngày đăng ký
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {candidate.full_name || "N/A"}
                          </div>
                          <div className="text-sm text-slate-500">
                            ID: #{candidate.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-slate-400" />
                          <span className="text-slate-700">{candidate.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-slate-400" />
                          <span className="text-slate-700">{candidate.phone || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        <FileText size={14} />
                        {candidate.total_applications || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        {candidate.accepted_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(candidate.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`${basePath}/candidates/${candidate.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                      >
                        <Eye size={16} />
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
