package com.veristay.controller;

import com.veristay.model.Property;
import com.veristay.model.User;
import com.veristay.repository.PropertyRepository;
import com.veristay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin("*") 
public class PropertyController {
    
    @Autowired private PropertyRepository propertyRepository;
    @Autowired private UserRepository userRepository;
    @Value("${file.upload-dir}") private String uploadDir;

    @GetMapping
    public ResponseEntity<List<Property>> getPublicProperties(@RequestParam(required = false) String type, @RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) return ResponseEntity.ok(propertyRepository.searchVerifiedProperties(search));
        if (type != null && !type.isEmpty()) return ResponseEntity.ok(propertyRepository.findByPropertyTypeAndVerifiedTrue(type));
        return ResponseEntity.ok(propertyRepository.findByVerifiedTrue());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Property>> getAllPropertiesForAdmin() {
        return ResponseEntity.ok(propertyRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return propertyRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Property>> getPropertiesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(propertyRepository.findByOwnerId(userId));
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveProperty(
            @RequestParam("title") String title, @RequestParam("price") BigDecimal price,
            @RequestParam("location") String location, @RequestParam("propertyType") String propertyType,
            @RequestParam("description") String description, @RequestParam("ownerName") String ownerName,
            @RequestParam("ownerContact") String ownerContact, @RequestParam("userId") Long userId, 
            @RequestParam(value = "areaSize", required = false) String areaSize,
            @RequestParam(value = "amenities", required = false) String amenities,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            // Changed from List to a single file string
            @RequestParam(value = "secondaryImageFile", required = false) MultipartFile secondaryImageFile) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "User not found."));

        Property property = new Property();
        property.setTitle(title); property.setPrice(price); property.setLocation(location);
        property.setPropertyType(propertyType); property.setDescription(description);
        property.setOwnerName(ownerName); property.setOwnerContact(ownerContact);
        property.setAreaSize(areaSize); property.setAmenities(amenities);
        property.setOwner(userOpt.get()); property.setVerified(false);

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
                Files.copy(imageFile.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
                property.setImageUrl("/uploads/" + fileName);
            }

            // Save the single secondary image without any loops
            if (secondaryImageFile != null && !secondaryImageFile.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + secondaryImageFile.getOriginalFilename();
                Files.copy(secondaryImageFile.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
                property.setSecondaryImageUrl("/uploads/" + fileName);
            }

            propertyRepository.save(property);
            return ResponseEntity.ok(Map.of("message", "Property listed successfully!"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to save images."));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id) {
        if (propertyRepository.existsById(id)) {
            propertyRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not found"));
    }
    
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyProperty(@PathVariable Long id) {
        return propertyRepository.findById(id).map(property -> {
            property.setVerified(true);
            propertyRepository.save(property);
            return ResponseEntity.ok(Map.of("message", "Verified"));
        }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Not found")));
    }
}