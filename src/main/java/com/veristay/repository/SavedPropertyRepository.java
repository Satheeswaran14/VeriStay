package com.veristay.repository;
import com.veristay.model.SavedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface SavedPropertyRepository extends JpaRepository<SavedProperty, Long> {
    List<SavedProperty> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<SavedProperty> findByUserIdAndPropertyId(Long userId, Long propertyId);
}