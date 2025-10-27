import {
  getAllCandidates,
  getCandidateById,
  getApplicationsByCandidateId,
  countCandidates,
} from '../repositories/candidateRepository.js';

/**
 * Controller để quản lý Candidates (ứng viên)
 */

// Lấy danh sách candidates
export async function getCandidates(req, res) {
  try {
    console.log('[candidateController] getCandidates called');
    console.log('[candidateController] Query params:', req.query);
    console.log('[candidateController] User:', req.user);
    
    const { search } = req.query;
    
    const filters = {};
    if (search) {
      filters.search = search;
    }

    const candidates = await getAllCandidates(filters);
    
    console.log('[candidateController] Retrieved candidates:', candidates.length);
    
    res.status(200).json({
      success: true,
      data: candidates,
      message: 'Lấy danh sách ứng viên thành công!',
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách ứng viên!',
      error: error.message,
    });
  }
}

// Lấy chi tiết 1 candidate
export async function getCandidateDetail(req, res) {
  try {
    const { id } = req.params;
    
    const candidate = await getCandidateById(parseInt(id));
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ứng viên!',
      });
    }

    res.status(200).json({
      success: true,
      data: candidate,
      message: 'Lấy thông tin ứng viên thành công!',
    });
  } catch (error) {
    console.error('Get candidate detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin ứng viên!',
    });
  }
}

// Lấy danh sách applications của 1 candidate
export async function getCandidateApplications(req, res) {
  try {
    const { id } = req.params;
    
    const applications = await getApplicationsByCandidateId(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: applications,
      message: 'Lấy danh sách hồ sơ thành công!',
    });
  } catch (error) {
    console.error('Get candidate applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hồ sơ!',
    });
  }
}

// Đếm số lượng candidates
export async function countCandidatesController(req, res) {
  try {
    const total = await countCandidates();
    
    res.status(200).json({
      success: true,
      data: { total },
      message: 'Đếm số lượng ứng viên thành công!',
    });
  } catch (error) {
    console.error('Count candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đếm số lượng ứng viên!',
    });
  }
}
