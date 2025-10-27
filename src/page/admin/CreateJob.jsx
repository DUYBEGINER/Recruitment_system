import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Card,
  message,
  Space,
  Row,
  Col,
} from 'antd';
import { Save, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../layout/AdminLayout';
import jobAPI from '../../api/jobAPI';

const { TextArea } = Input;
const { Option } = Select;

function CreateJob() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Format dữ liệu
      const jobData = {
        title: values.title,
        description: values.description,
        requirements: values.requirements,
        benefits: values.benefits,
        location: values.location,
        employmentType: values.employmentType,
        experienceLevel: values.experienceLevel,
        salaryMin: values.salaryMin || null,
        salaryMax: values.salaryMax || null,
        numberOfPositions: values.numberOfPositions || 1,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        status: 'PENDING', // Trạng thái mặc định là chờ duyệt
      };

      const response = await jobAPI.createJob(jobData);
      
      if (response.success) {
        message.success('Tạo tin tuyển dụng thành công! Đang chờ phê duyệt.');
        form.resetFields();
        // Chuyển về trang danh sách jobs
        setTimeout(() => {
          navigate('/HR/jobs');
        }, 1000);
      } else {
        message.error(response.message || 'Tạo tin tuyển dụng thất bại!');
      }
    } catch (error) {
      console.error('Create job error:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tạo tin tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý quay lại
  const handleBack = () => {
    navigate('/HR/jobs');
  };

  return (
    <AdminLayout title="Tạo tin tuyển dụng">
      <div className="mb-6">
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={handleBack}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>
        
        <h2 className="text-2xl font-bold text-slate-900">Tạo tin tuyển dụng mới</h2>
        <p className="text-slate-600 mt-1">
          Tin tuyển dụng sẽ ở trạng thái <span className="font-semibold text-amber-600">Chờ duyệt</span> sau khi tạo
        </p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          {/* Thông tin cơ bản */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b">
              Thông tin cơ bản
            </h3>
            
            <Form.Item
              label="Chức danh tuyển dụng"
              name="title"
              rules={[
                { required: true, message: 'Vui lòng nhập chức danh!' },
                { min: 5, message: 'Chức danh phải có ít nhất 5 ký tự!' },
              ]}
            >
              <Input
                placeholder="VD: Frontend Developer, Backend Java..."
                size="large"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Khu vực làm việc"
                  name="location"
                  rules={[{ required: true, message: 'Vui lòng chọn khu vực!' }]}
                >
                  <Select placeholder="Chọn khu vực" size="large">
                    <Option value="Hà Nội">Hà Nội</Option>
                    <Option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</Option>
                    <Option value="Đà Nẵng">Đà Nẵng</Option>
                    <Option value="Hải Phòng">Hải Phòng</Option>
                    <Option value="Cần Thơ">Cần Thơ</Option>
                    <Option value="Bình Dương">Bình Dương</Option>
                    <Option value="Đồng Nai">Đồng Nai</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Hình thức làm việc"
                  name="employmentType"
                  rules={[{ required: true, message: 'Vui lòng chọn hình thức!' }]}
                >
                  <Select placeholder="Chọn hình thức" size="large">
                    <Option value="Full-time">Full-time</Option>
                    <Option value="Part-time">Part-time</Option>
                    <Option value="Remote">Remote</Option>
                    <Option value="Hybrid">Hybrid</Option>
                    <Option value="Internship">Internship</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Cấp bậc"
              name="experienceLevel"
              rules={[{ required: true, message: 'Vui lòng chọn cấp bậc!' }]}
            >
              <Select placeholder="Chọn cấp bậc" size="large">
                <Option value="Intern">Intern</Option>
                <Option value="Fresher">Fresher</Option>
                <Option value="Junior">Junior</Option>
                <Option value="Middle">Middle</Option>
                <Option value="Senior">Senior</Option>
                <Option value="Leader">Leader</Option>
                <Option value="Manager">Manager</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Mô tả công việc */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b">
              Mô tả công việc
            </h3>
            
            <Form.Item
              label="Mô tả chi tiết"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả công việc!' },
                { min: 50, message: 'Mô tả phải có ít nhất 50 ký tự!' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Mô tả chi tiết về công việc, trách nhiệm, nhiệm vụ..."
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Form.Item
              label="Yêu cầu ứng viên"
              name="requirements"
              rules={[
                { required: true, message: 'Vui lòng nhập yêu cầu!' },
                { min: 30, message: 'Yêu cầu phải có ít nhất 30 ký tự!' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Các yêu cầu về kỹ năng, kinh nghiệm, bằng cấp..."
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Form.Item
              label="Quyền lợi"
              name="benefits"
              rules={[{ min: 20, message: 'Quyền lợi phải có ít nhất 20 ký tự!' }]}
            >
              <TextArea
                rows={4}
                placeholder="Các quyền lợi, phúc lợi khi làm việc tại công ty..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </div>

          {/* Thông tin bổ sung */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b">
              Thông tin bổ sung
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mức lương tối thiểu (VNĐ)"
                  name="salaryMin"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    step={1000000}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="VD: 10000000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Mức lương tối đa (VNĐ)"
                  name="salaryMax"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    step={1000000}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="VD: 20000000"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số lượng tuyển"
                  name="numberOfPositions"
                  initialValue={1}
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    size="large"
                    min={1}
                    max={100}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Hạn nộp hồ sơ"
                  name="deadline"
                  rules={[{ required: true, message: 'Vui lòng chọn hạn nộp!' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Thông tin liên hệ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b">
              Thông tin liên hệ
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email liên hệ"
                  name="contactEmail"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' },
                  ]}
                >
                  <Input
                    placeholder="contact@company.com"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại liên hệ"
                  name="contactPhone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' },
                  ]}
                >
                  <Input
                    placeholder="0123456789"
                    size="large"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Buttons */}
          <Form.Item className="mb-0">
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                icon={<Save size={18} />}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Đang tạo...' : 'Tạo tin tuyển dụng'}
              </Button>
              
              <Button
                size="large"
                onClick={handleBack}
                disabled={loading}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </AdminLayout>
  );
}

export default CreateJob;