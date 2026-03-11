package com.shop.fashion.service;

import com.shop.fashion.dto.request.AddressRequest;
import com.shop.fashion.entity.DiaChiGiaoHang;

import java.util.List;

public interface DiaChiGiaoHangService {
    List<DiaChiGiaoHang> getAllAddressesByUserId(Long userId);

    DiaChiGiaoHang addAddress(Long userId, AddressRequest request);

    DiaChiGiaoHang setDefaultAddress(Long userId, Long addressId);

    void deleteAddress(Long userId, Long addressId);
}
