package com.shop.fashion.service;

import com.shop.fashion.entity.ThanhToan;
import com.shop.fashion.repository.ThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;

    public Optional<ThanhToan> layThanhToanTheoDonHang(Long donHangId) {
        return thanhToanRepository.findByDonHangId(donHangId);
    }

    public ThanhToan luuThanhToan(ThanhToan thanhToan) {
        return thanhToanRepository.save(thanhToan);
    }
}
