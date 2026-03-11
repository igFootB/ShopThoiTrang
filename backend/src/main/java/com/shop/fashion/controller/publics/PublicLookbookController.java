package com.shop.fashion.controller.publics;

import com.shop.fashion.entity.Lookbook;
import com.shop.fashion.repository.LookbookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/lookbooks")
@CrossOrigin("*")
public class PublicLookbookController {

    @Autowired
    private LookbookRepository lookbookRepository;

    @GetMapping
    public ResponseEntity<?> getActiveLookbooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {

        Pageable pageable = PageRequest.of(page, limit);
        Page<Lookbook> lookbookPage = lookbookRepository.findActiveLookbooks(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", lookbookPage.getContent());
        response.put("totalPages", lookbookPage.getTotalPages());
        response.put("totalElements", lookbookPage.getTotalElements());

        return ResponseEntity.ok(response);
    }
}
