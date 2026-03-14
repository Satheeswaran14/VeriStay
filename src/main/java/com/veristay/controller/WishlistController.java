package com.veristay.controller;

import com.veristay.model.Property;
import com.veristay.model.SavedProperty;
import com.veristay.repository.PropertyRepository;
import com.veristay.repository.SavedPropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private SavedPropertyRepository savedPropertyRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    // View user's wishlist
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedProperty>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(savedPropertyRepository.findByUserIdOrderBySavedAtDesc(userId));
    }

    // Check if a property is already saved
    @GetMapping("/check/{userId}/{propertyId}")
    public ResponseEntity<Boolean> checkIfSaved(@PathVariable Long userId, @PathVariable Long propertyId) {
        boolean isSaved = savedPropertyRepository.findByUserIdAndPropertyId(userId, propertyId).isPresent();
        return ResponseEntity.ok(isSaved);
    }

    // Toggle Save/Unsave
    @PostMapping("/toggle/{userId}/{propertyId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long userId, @PathVariable Long propertyId) {
        Optional<SavedProperty> existing = savedPropertyRepository.findByUserIdAndPropertyId(userId, propertyId);
        
        if (existing.isPresent()) {
            // If it's already saved, UN-SAVE it (delete)
            savedPropertyRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("status", "removed", "message", "Removed from wishlist"));
        } else {
            // If not saved, SAVE it
            Optional<Property> property = propertyRepository.findById(propertyId);
            if (property.isPresent()) {
                SavedProperty newSave = new SavedProperty();
                newSave.setUserId(userId);
                newSave.setProperty(property.get());
                savedPropertyRepository.save(newSave);
                return ResponseEntity.ok(Map.of("status", "added", "message", "Added to wishlist"));
            }
            return ResponseEntity.notFound().build();
        }
    }
}