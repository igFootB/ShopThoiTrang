package com.shop.fashion.service;

import com.shop.fashion.entity.DanhGia;
import com.shop.fashion.repository.DanhGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DanhGiaService {

    private final DanhGiaRepository danhGiaRepository;
    private final com.shop.fashion.repository.DonHangRepository donHangRepository;
    private final com.shop.fashion.repository.ChiTietDonHangRepository chiTietDonHangRepository;
    private final com.shop.fashion.repository.NguoiDungRepository nguoiDungRepository;
    private final com.shop.fashion.repository.SanPhamRepository sanPhamRepository;

    @org.springframework.transaction.annotation.Transactional
    public DanhGia createReview(Long userId, com.shop.fashion.dto.request.ReviewRequest request) {
        // 1. Kiểm tra đơn hàng thuộc về user và có trạng thái DELIVERED
        com.shop.fashion.entity.DonHang order = donHangRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (!order.getNguoiDung().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đánh giá đơn hàng này");
        }

        if (!"DELIVERED".equals(order.getTrangThai())) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao thành công");
        }

        // 2. Kiểm tra xem sản phẩm có trong đơn hàng này không
        boolean hasPurchased = chiTietDonHangRepository.findByDonHangId(request.getOrderId()).stream()
                .anyMatch(item -> item.getBienTheSanPham().getSanPham().getId().equals(request.getProductId()));

        if (!hasPurchased) {
            throw new RuntimeException("Sản phẩm này không nằm trong đơn hàng của bạn");
        }

        // 3. Lưu đánh giá
        DanhGia review = new DanhGia();
        review.setNguoiDung(nguoiDungRepository.getReferenceById(userId));
        review.setSanPham(sanPhamRepository.getReferenceById(request.getProductId()));
        review.setDonHang(order);
        review.setDanhGia(request.getRating());
        review.setBinhLuan(request.getComment());

        return danhGiaRepository.save(review);
    }

    public com.shop.fashion.dto.response.ProductReviewListResponse getProductReviews(Long productId) {
        List<DanhGia> reviews = danhGiaRepository.findBySanPhamId(productId);
        Double averageRating = danhGiaRepository.getAverageRatingBySanPhamId(productId);

        List<com.shop.fashion.dto.response.ReviewResponse> reviewResponses = reviews.stream()
                .map(r -> new com.shop.fashion.dto.response.ReviewResponse(
                        r.getNguoiDung().getTen(),
                        r.getDanhGia(),
                        r.getBinhLuan(),
                        r.getNgayTao()
                )).collect(java.util.stream.Collectors.toList());

        return new com.shop.fashion.dto.response.ProductReviewListResponse(
                averageRating != null ? averageRating : 0.0,
                reviewResponses
        );
    }
}
