package com.shop.fashion.service;

import com.shop.fashion.entity.DanhMuc;
import com.shop.fashion.repository.DanhMucRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;

    public List<DanhMuc> layTatCaDanhMuc() {
        return danhMucRepository.findAll();
    }

    public Optional<DanhMuc> layDanhMucTheoId(Long id) {
        return danhMucRepository.findById(id);
    }

    public DanhMuc luuDanhMuc(DanhMuc danhMuc) {
        return danhMucRepository.save(danhMuc);
    }

    public void xoaDanhMucBangId(Long id) {
        danhMucRepository.deleteById(id);
    }
}
