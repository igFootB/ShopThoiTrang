package com.shop.fashion.service.impl;

import com.shop.fashion.dto.request.CreateProductRequest;
import com.shop.fashion.dto.request.VariantRequest;
import com.shop.fashion.entity.BienTheSanPham;
import com.shop.fashion.entity.HinhAnhSanPham;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.BienTheSanPhamRepository;
import com.shop.fashion.repository.DanhMucRepository;
import com.shop.fashion.repository.HinhAnhSanPhamRepository;
import com.shop.fashion.repository.SanPhamRepository;
import com.shop.fashion.service.AdminSanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class AdminSanPhamServiceImpl implements AdminSanPhamService {

    private final SanPhamRepository sanPhamRepository;
    private final DanhMucRepository danhMucRepository;
    private final HinhAnhSanPhamRepository hinhAnhSanPhamRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SanPham createProduct(CreateProductRequest request) {
        // 1. Tạo sản phẩm gốc
        SanPham newProduct = new SanPham();
        newProduct.setTenSanPham(request.getTenSanPham());
        newProduct.setMoTa(request.getMoTa());
        newProduct.setGia(request.getGia());
        newProduct.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : 1);

        if (request.getDanhMucId() != null) {
            Long danhMucId = request.getDanhMucId();
            newProduct.setDanhMuc(danhMucRepository.findById(danhMucId)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
        }

        SanPham savedProduct = sanPhamRepository.save(newProduct);

        // 2. Lưu hình ảnh mặc định (không gắn màu)
        saveImages(savedProduct, request);


        // 3. Lưu biến thể
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (VariantRequest variantReq : request.getVariants()) {
                BienTheSanPham variant = new BienTheSanPham();
                variant.setSanPham(savedProduct);
                variant.setSize(variantReq.getSize());
                variant.setMauSac(variantReq.getMauSac());
                variant.setSoLuong(variantReq.getSoLuong());
                bienTheSanPhamRepository.save(variant);
            }
        }

        return savedProduct;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SanPham updateProduct(Long id, CreateProductRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("ID sản phẩm không được null");
        }
        SanPham product = sanPhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        product.setTenSanPham(request.getTenSanPham());
        product.setMoTa(request.getMoTa());
        product.setGia(request.getGia());
        if (request.getTrangThai() != null) {
            product.setTrangThai(request.getTrangThai());
        }

        if (request.getDanhMucId() != null) {
            Long danhMucId = request.getDanhMucId();
            product.setDanhMuc(danhMucRepository.findById(danhMucId)
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại")));
        }

        // Cập nhật hình ảnh (xoá ảnh cũ, lưu ảnh mới)
        java.util.List<HinhAnhSanPham> oldImages = hinhAnhSanPhamRepository.findBySanPhamId(product.getId());
        if (!oldImages.isEmpty()) {
            hinhAnhSanPhamRepository.deleteAll(oldImages);
            hinhAnhSanPhamRepository.flush();
        }
        saveImages(product, request);

        return sanPhamRepository.save(product);
    }

    // === Helper: Lưu ảnh mặc định + ảnh theo màu ===
    private void saveImages(SanPham product, CreateProductRequest request) {
        boolean isFirst = true;
        // Ảnh mặc định (không gắn màu)
        if (request.getHinhAnh() != null && !request.getHinhAnh().isEmpty()) {
            for (String url : request.getHinhAnh()) {
                if (url == null || url.isBlank()) continue;
                HinhAnhSanPham img = new HinhAnhSanPham();
                img.setSanPham(product);
                img.setDuongDanAnh(url);
                img.setIsThumbnail(isFirst ? 1 : 0);
                img.setMauSac(null);
                hinhAnhSanPhamRepository.save(img);
                isFirst = false;
            }
        }
        // Ảnh theo màu sắc
        if (request.getColorImages() != null) {
            for (CreateProductRequest.ColorImageRequest ci : request.getColorImages()) {
                if (ci.getMauSac() == null || ci.getUrls() == null) continue;
                for (String url : ci.getUrls()) {
                    if (url == null || url.isBlank()) continue;
                    HinhAnhSanPham img = new HinhAnhSanPham();
                    img.setSanPham(product);
                    img.setDuongDanAnh(url);
                    img.setIsThumbnail(isFirst ? 1 : 0);
                    img.setMauSac(ci.getMauSac());
                    hinhAnhSanPhamRepository.save(img);
                    isFirst = false;
                }
            }
        }
    }

    @Override
    @Transactional
    public void softDeleteProduct(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID sản phẩm không được null");
        }
        SanPham product = sanPhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        // Soft delete bằng cách set trangThai = 0 (Ẩn)
        product.setTrangThai(0);
        sanPhamRepository.save(product);
    }

    @Override
    @Transactional
    public void hardDeleteProduct(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID sản phẩm không được null");
        }
        SanPham product = sanPhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        // Cần xoá ảnh và biến thể trước nếu DB không có CASCADE (Bảo vệ tính vẹn toàn ngầm)
        java.util.List<HinhAnhSanPham> images = hinhAnhSanPhamRepository.findBySanPhamId(id);
        if (!images.isEmpty()) {
            hinhAnhSanPhamRepository.deleteAll(images);
        }
        java.util.List<BienTheSanPham> variants = bienTheSanPhamRepository.findBySanPhamId(id);
        if (!variants.isEmpty()) {
            bienTheSanPhamRepository.deleteAll(variants);
        }

        sanPhamRepository.delete(product);
    }
}
