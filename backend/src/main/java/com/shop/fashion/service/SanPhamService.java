package com.shop.fashion.service;

import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final com.shop.fashion.repository.HinhAnhSanPhamRepository hinhAnhSanPhamRepository;
    private final com.shop.fashion.repository.BienTheSanPhamRepository bienTheSanPhamRepository;

    public List<SanPham> layTatCaSanPham() {
        return sanPhamRepository.findAll();
    }

    public List<SanPham> laySanPhamTheoDanhMuc(Long danhMucId) {
        return sanPhamRepository.findByDanhMucId(danhMucId);
    }



    public Optional<SanPham> laySanPhamTheoId(Long id) {
        return sanPhamRepository.findById(id);
    }

    public SanPham luuSanPham(SanPham sanPham) {
        return sanPhamRepository.save(sanPham);
    }

    public org.springframework.data.domain.Page<com.shop.fashion.dto.response.ProductListResponse> filterProducts(
            Long categoryId, String keyword, int page, int limit) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, limit);
        return sanPhamRepository.filterProducts(categoryId, keyword, pageable);
    }

    public com.shop.fashion.dto.response.ProductDetailResponse getProductDetail(Long id) {
        SanPham sanPham = sanPhamRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Lỗi: Không tìm thấy sản phẩm với id: " + id));

        java.util.List<com.shop.fashion.entity.HinhAnhSanPham> images = hinhAnhSanPhamRepository.findBySanPhamId(id);
        java.util.List<com.shop.fashion.entity.BienTheSanPham> variants = bienTheSanPhamRepository.findBySanPhamId(id);

        java.util.List<com.shop.fashion.dto.response.ImageResponse> imageResponses = images.stream()
                .map(img -> new com.shop.fashion.dto.response.ImageResponse(img.getId(), img.getDuongDanAnh(), img.getIsThumbnail(), img.getMauSac()))
                .collect(java.util.stream.Collectors.toList());

        java.util.List<com.shop.fashion.dto.response.VariantResponse> variantResponses = variants.stream()
                .map(var -> new com.shop.fashion.dto.response.VariantResponse(var.getId(), var.getSize(), var.getMauSac(), var.getSoLuong()))
                .collect(java.util.stream.Collectors.toList());

        return new com.shop.fashion.dto.response.ProductDetailResponse(
                sanPham.getId(),
                sanPham.getTenSanPham(),
                sanPham.getMoTa(),
                sanPham.getGia(),
                sanPham.getDanhMuc() != null ? sanPham.getDanhMuc().getId() : null,
                sanPham.getTrangThai(),
                imageResponses,
                variantResponses
        );
    }
}
