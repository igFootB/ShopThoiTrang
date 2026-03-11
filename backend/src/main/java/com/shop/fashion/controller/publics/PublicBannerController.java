package com.shop.fashion.controller.publics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shop.fashion.entity.Banner;
import com.shop.fashion.repository.BannerRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/banners")
@CrossOrigin("*")
public class PublicBannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<?> getActiveBanners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        
        Pageable pageable = PageRequest.of(page, limit);
        Page<Banner> bannerPage = bannerRepository.findActiveBanners(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", bannerPage.getContent());
        response.put("totalPages", bannerPage.getTotalPages());
        response.put("totalElements", bannerPage.getTotalElements());
        
        return ResponseEntity.ok(response);
    }
}
