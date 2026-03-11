package com.shop.fashion.service;

import com.shop.fashion.entity.GoiYSanPham;
import com.shop.fashion.repository.GoiYSanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AIService {

    private final GoiYSanPhamRepository goiYSanPhamRepository;

    public List<GoiYSanPham> layGoiYChoNguoiDung(Long nguoiDungId) {
        return goiYSanPhamRepository.findByNguoiDungId(nguoiDungId);
    }
}
