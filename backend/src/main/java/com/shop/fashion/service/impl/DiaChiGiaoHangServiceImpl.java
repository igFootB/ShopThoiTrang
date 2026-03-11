package com.shop.fashion.service.impl;

import com.shop.fashion.dto.request.AddressRequest;
import com.shop.fashion.entity.DiaChiGiaoHang;
import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.repository.DiaChiGiaoHangRepository;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.service.DiaChiGiaoHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaChiGiaoHangServiceImpl implements DiaChiGiaoHangService {

    private final DiaChiGiaoHangRepository diaChiRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Override
    public List<DiaChiGiaoHang> getAllAddressesByUserId(Long userId) {
        return diaChiRepository.findByNguoiDungId(userId);
    }

    @Override
    @Transactional
    public DiaChiGiaoHang addAddress(Long userId, AddressRequest request) {
        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Nếu isDefault = 1, reset các địa chỉ khác của user về 0
        if (request.getIsDefault() != null && request.getIsDefault() == 1) {
            diaChiRepository.resetDefaultAddressForUser(userId);
        }

        DiaChiGiaoHang address = new DiaChiGiaoHang();
        address.setNguoiDung(user);
        address.setTenNguoiNhan(request.getTenNguoiNhan());
        address.setSoDienThoai(request.getSoDienThoai());
        address.setDiaChi(request.getDiaChi());
        address.setThanhPho(request.getThanhPho());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : 0);

        // Nếu đây là địa chỉ đầu tiên, tự động cho làm mặc định
        List<DiaChiGiaoHang> existingAddresses = diaChiRepository.findByNguoiDungId(userId);
        if (existingAddresses.isEmpty()) {
            address.setIsDefault(1);
        }

        return diaChiRepository.save(address);
    }

    @Override
    @Transactional
    public DiaChiGiaoHang setDefaultAddress(Long userId, Long addressId) {
        DiaChiGiaoHang address = diaChiRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (!address.getNguoiDung().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền thay đổi địa chỉ này");
        }

        // Reset tất cả về 0
        diaChiRepository.resetDefaultAddressForUser(userId);

        // Đặt địa chỉ hiện tại thành 1
        address.setIsDefault(1);
        return diaChiRepository.save(address);
    }

    @Override
    public void deleteAddress(Long userId, Long addressId) {
        DiaChiGiaoHang address = diaChiRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (!address.getNguoiDung().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xóa địa chỉ này");
        }

        diaChiRepository.delete(address);
    }
}
