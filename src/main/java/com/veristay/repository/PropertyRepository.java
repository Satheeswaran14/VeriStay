package com.veristay.repository;

import com.veristay.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    // Public Queries
    List<Property> findByVerifiedTrue();
    List<Property> findByPropertyTypeAndVerifiedTrue(String type);
    @Query("SELECT p FROM Property p WHERE p.verified = true AND (LOWER(p.location) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Property> searchVerifiedProperties(@Param("query") String query);

    // Secure Queries
    List<Property> findByOwnerId(Long userId);
    long countByVerifiedFalse();
}