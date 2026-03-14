package com.veristay.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "properties")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Property {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal price;
    private String location;
    private String propertyType; 
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Dynamic Fields
    private String areaSize; 
    private String amenities; 
    
    private String ownerName;
    private String ownerContact;
    
    // BOTH IMAGES IN ONE TABLE NOW!
    private String imageUrl; 
    private String secondaryImageUrl; 
    
    private boolean verified = false; 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id") 
    @JsonIgnore
    private User owner;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAreaSize() { return areaSize; }
    public void setAreaSize(String areaSize) { this.areaSize = areaSize; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOwnerContact() { return ownerContact; }
    public void setOwnerContact(String ownerContact) { this.ownerContact = ownerContact; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public String getSecondaryImageUrl() { return secondaryImageUrl; }
    public void setSecondaryImageUrl(String secondaryImageUrl) { this.secondaryImageUrl = secondaryImageUrl; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}