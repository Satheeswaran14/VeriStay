package com.veristay.controller;

import com.veristay.model.Review;
import com.veristay.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // Public: Anyone can view reviews
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Review>> getPropertyReviews(@PathVariable Long propertyId) {
        return ResponseEntity.ok(reviewRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId));
    }

    // Secure: Only logged-in users can submit a review
    @PostMapping("/submit")
    public ResponseEntity<?> submitReview(@RequestBody Review review) {
        reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Review submitted successfully!"));
    }
}