package com.shop.fashion.service;

import com.shop.fashion.entity.MaGiamGia;
import com.shop.fashion.repository.MaGiamGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaGiamGiaService {

    private final MaGiamGiaRepository maGiamGiaRepository;

    public Optional<MaGiamGia> kiemTraMaGiamGia(String maGiamGia) {
        return maGiamGiaRepository.findByMaGiamGia(maGiamGia);
    }

    public MaGiamGia luuMaGiamGia(MaGiamGia maGiamGia) {
        return maGiamGiaRepository.save(maGiamGia);
    }
}
