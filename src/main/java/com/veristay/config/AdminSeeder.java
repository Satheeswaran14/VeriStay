package com.veristay.config;

import com.veristay.model.Admin;
import com.veristay.repository.AdminRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder {

    @Autowired private AdminRepository adminRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedMasterAdmin() {
        // Check if CEO already exists in the admins table
        if (adminRepository.findByEmail("ceo@veristay.com").isEmpty()) {
            Admin ceo = new Admin();
            ceo.setFullName("Master CEO");
            ceo.setEmail("ceo@veristay.com");
            ceo.setPassword(passwordEncoder.encode("CeoPassword123!")); // Change this to your preferred secure password!
            adminRepository.save(ceo);
            System.out.println("MASTER CEO ACCOUNT GENERATED SUCCESSFULLY.");
        }
    }
}