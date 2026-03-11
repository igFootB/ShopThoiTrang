package com.shop.fashion.service;

import com.shop.fashion.entity.Quyen;
import com.shop.fashion.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuyenService {

    private final QuyenRepository quyenRepository;

    public List<Quyen> layTatCaQuyen() {
        return quyenRepository.findAll();
    }
}
