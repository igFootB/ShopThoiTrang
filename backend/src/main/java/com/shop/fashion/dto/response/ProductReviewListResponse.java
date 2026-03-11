package com.shop.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewListResponse {
    private Double averageRating;
    private List<ReviewResponse> reviews;
}
