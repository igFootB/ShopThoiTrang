package com.shop.fashion.controller.admin;

import com.shop.fashion.repository.ChiTietDonHangRepository;
import com.shop.fashion.repository.DonHangRepository;
import com.shop.fashion.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @GetMapping
    public ResponseEntity<?> getDashboardOverview() {
        try {
            LocalDate today = LocalDate.now();
            int month = today.getMonthValue();
            int year = today.getYear();

            // 1. Lấy tổng doanh thu tháng này
            BigDecimal totalRevenue = donHangRepository.getTotalRevenueByMonthAndYear(month, year);
            if (totalRevenue == null) {
                totalRevenue = BigDecimal.ZERO;
            }

            // 1.1 Tính số lượng đơn hàng tổng
            long totalOrders = donHangRepository.count();

            // 1.2 Tính tổng số lượng khách hàng (Giả định role_id của khách là cố định, tạm
            // lấy tổng cho ALL users)
            long totalUsers = nguoiDungRepository.count();

            // 2. Lấy Top 5 sản phẩm bán chạy nhất tháng này
            List<Object[]> topProductsData = chiTietDonHangRepository.getTopSellingProducts(month, year,
                    PageRequest.of(0, 5));

            List<Map<String, Object>> topProducts = topProductsData.stream().map(data -> {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("productId", data[0]);
                productMap.put("productName", data[1]);
                productMap.put("totalSold", data[2]);
                return productMap;
            }).collect(Collectors.toList());

            // 3. Chuẩn bị response
            Map<String, Object> response = new HashMap<>();
            response.put("doanhThuThangNay", totalRevenue);
            response.put("tongSoDonHang", totalOrders);
            response.put("tongSoKhachHang", totalUsers);
            response.put("topSanPhamBanChay", topProducts);
            response.put("thangThongKe", month + "/" + year);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi lấy dữ liệu thống kê: " + e.getMessage()));
        }
    }
}
