import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Spin, Alert } from 'antd';
import { ArrowLeft, Calendar, MapPin, Briefcase, Users, DollarSign, Mail, Phone } from 'lucide-react';
import AdminLayout from '../../layout/AdminLayout';
import jobAPI from '../../api/jobAPI';
import useAuth from '../../hook/useAuth';

const StatusTag = ({ status }) => {
  const map = {
    draft:   { color: 'default', text: 'Nháp' },
    pending: { color: 'orange', text: 'Chờ duyệt' },
    reject:  { color: 'red', text: 'Bị từ chối' },
    approve: { color: 'green', text: 'Đã duyệt' },
    close:   { color: 'gray', text: 'Đã đóng' },
  };
  const { color, text } = map[status] || { color: 'default', text: status };
  return <Tag color={color}>{text}</Tag>;
};

export default function AdminJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Xác định base path theo role
  const basePath = user?.role === 'TPNS' ? '/TPNS' : '/HR';

  useEffect(() => {
    fetchJobDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobByIdEmployer(id);
      if (response.success) {
        setJob(response.data);
      } else {
        setError('Không tìm thấy tin tuyển dụng!');
      }
    } catch (err) {
      console.error('Error fetching job detail:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải thông tin tin tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết tin tuyển dụng">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !job) {
    return (
      <AdminLayout title="Chi tiết tin tuyển dụng">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy tin tuyển dụng!'}
          type="error"
          showIcon
        />
        <Button className="mt-4" onClick={() => navigate(`${basePath}/jobs`)}>
          Quay lại danh sách
        </Button>
      </AdminLayout>
    );
  }

  const isOwner = job.employer_id === user?.id;
  // Cho phép edit: draft, reject, approve, close (trừ pending)
  const canEdit = job.status !== 'pending' && (user?.role === 'TPNS' || isOwner);

  return (
    <AdminLayout title={`Chi tiết: ${job.title}`}>
      <div className="mb-6 flex items-center justify-between">
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(`${basePath}/jobs`)}
        >
          Quay lại danh sách
        </Button>
        
        <Space>
          <StatusTag status={job.status} />
          {canEdit && (
            <Link to={`/HR/jobs/${id}/edit`}>
              <Button type="primary" className="bg-red-600 hover:bg-red-700">
                Chỉnh sửa
              </Button>
            </Link>
          )}
        </Space>
      </div>

      {/* Thông tin cơ bản */}
      <Card title="Thông tin cơ bản" className="mb-4">
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Chức danh" span={2}>
            <span className="font-semibold text-lg">{job.title}</span>
          </Descriptions.Item>
          
          <Descriptions.Item label={<><MapPin size={16} className="inline mr-1" />Khu vực</>}>
            {job.location}
          </Descriptions.Item>
          
          <Descriptions.Item label={<><Briefcase size={16} className="inline mr-1" />Hình thức</>}>
            {job.job_type}
          </Descriptions.Item>
          
          <Descriptions.Item label="Cấp bậc">
            {job.level}
          </Descriptions.Item>
          
          <Descriptions.Item label={<><Users size={16} className="inline mr-1" />Số lượng</>}>
            {job.quantity} người
          </Descriptions.Item>
          
          <Descriptions.Item label={<><DollarSign size={16} className="inline mr-1" />Mức lương</>} span={2}>
            {job.salary_min && job.salary_max 
              ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
              : formatCurrency(job.salary_min || job.salary_max)}
          </Descriptions.Item>
          
          <Descriptions.Item label={<><Calendar size={16} className="inline mr-1" />Hạn nộp</>}>
            {formatDate(job.deadline)}
          </Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái">
            <StatusTag status={job.status} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Mô tả công việc */}
      <Card title="Mô tả công việc" className="mb-4">
        <div className="prose max-w-none whitespace-pre-wrap">
          {job.description}
        </div>
      </Card>

      {/* Yêu cầu ứng viên */}
      <Card title="Yêu cầu ứng viên" className="mb-4">
        <div className="prose max-w-none whitespace-pre-wrap">
          {job.requirements}
        </div>
      </Card>

      {/* Quyền lợi */}
      {job.benefits && (
        <Card title="Quyền lợi" className="mb-4">
          <div className="prose max-w-none whitespace-pre-wrap">
            {job.benefits}
          </div>
        </Card>
      )}

      {/* Thông tin liên hệ */}
      <Card title="Thông tin liên hệ">
        <Descriptions column={1} bordered>
          <Descriptions.Item label={<><Mail size={16} className="inline mr-1" />Email</>}>
            <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">
              {job.contact_email}
            </a>
          </Descriptions.Item>
          
          <Descriptions.Item label={<><Phone size={16} className="inline mr-1" />Số điện thoại</>}>
            <a href={`tel:${job.contact_phone}`} className="text-blue-600 hover:underline">
              {job.contact_phone}
            </a>
          </Descriptions.Item>
          
          <Descriptions.Item label="Người tạo">
            {job.employer_name} ({job.employer_role})
          </Descriptions.Item>
          
          <Descriptions.Item label="Ngày tạo">
            {formatDate(job.created_at)}
          </Descriptions.Item>
          
          {job.updated_at && (
            <Descriptions.Item label="Cập nhật lần cuối">
              {formatDate(job.updated_at)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Lý do từ chối (nếu có) */}
      {job.status === 'reject' && job.reject_reason && (
        <Card title="Lý do từ chối" className="mt-4 border-red-200">
          <Alert
            message={job.reject_reason}
            type="error"
            showIcon
          />
        </Card>
      )}
    </AdminLayout>
  );
}
