import { useState, useEffect } from 'react';
import { Upload, Button, Table, message, Modal, Card, Space, Typography, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import uploadAPI from '../../api/uploadAPI';

const { Dragger } = Upload;
const { Title } = Typography;
const { confirm } = Modal;

const UploadFile = () => {
  const [fileList, setFileList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Lấy danh sách files khi component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Lấy danh sách files từ server
  const fetchUploadedFiles = async () => {
    try {
      setLoading(true);
      const response = await uploadAPI.getFiles();
      console.log('Fetched files response:', response);
      if (response?.data.success) {
        setUploadedFiles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      message.error('Lỗi khi lấy danh sách files!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload file
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file để upload!');
      return;
    }

    try {
      setUploading(true);
      const file = fileList[0];
      const response = await uploadAPI.uploadFile(file);
      console.log('Upload response:', response);
      if (response?.data.success) {
        message.success('Upload file thành công!');
        setFileList([]);
        fetchUploadedFiles(); // Refresh danh sách
      } else {
        message.error(response.message || 'Upload file thất bại!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.message || 'Lỗi khi upload file!');
    } finally {
      setUploading(false);
    }
  };

  // Xử lý xóa file
  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa file',
      content: `Bạn có chắc chắn muốn xóa file này?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await uploadAPI.deleteFile(record.id);
          if (response.success) {
            message.success('Xóa file thành công!');
            fetchUploadedFiles(); // Refresh danh sách
          }
        } catch (error) {
          console.error('Delete error:', error);
          message.error('Lỗi khi xóa file!');
        }
      },
    });
  };

  // Xem file
  const handleView = (record) => {
    const fileUrl = `http://localhost:5000${record.url}`;
    window.open(fileUrl, '_blank');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Get file type color
  const getFileTypeColor = (mimeType) => {
    if (mimeType.includes('pdf')) return 'red';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'blue';
    return 'default';
  };

  // Columns cho table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'File Type',
      dataIndex: 'mime_type',
      key: 'mime_type',
      width: 150,
      render: (mimeType) => (
        <Tag color={getFileTypeColor(mimeType)}>
          {mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: 'File Size',
      dataIndex: 'size_bytes',
      key: 'size_bytes',
      width: 120,
      render: (size) => formatFileSize(size),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Props cho Dragger
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Kiểm tra loại file
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        message.error('Chỉ chấp nhận file PDF, DOC, hoặc DOCX!');
        return Upload.LIST_IGNORE;
      }

      // Kiểm tra kích thước file (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('File không được vượt quá 5MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]); // Chỉ cho phép upload 1 file tại 1 thời điểm
      return false; // Prevent auto upload
    },
    fileList,
    maxCount: 1,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Test Upload File</Title>
      
      {/* Upload Section */}
      <Card title="Upload New File" style={{ marginBottom: 24 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click hoặc kéo file vào đây để upload</p>
          <p className="ant-upload-hint">
            Chỉ hỗ trợ file PDF, DOC, DOCX. Kích thước tối đa 5MB.
          </p>
        </Dragger>
        
        <Button
          type="primary"
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          icon={<UploadOutlined />}
          style={{ marginTop: 16 }}
          size="large"
        >
          {uploading ? 'Đang upload...' : 'Upload'}
        </Button>
      </Card>

      {/* Files Table */}
      <Card title={`Danh sách Files (${uploadedFiles.length})`}>
        <Table
          columns={columns}
          dataSource={uploadedFiles}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} files`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default UploadFile;
