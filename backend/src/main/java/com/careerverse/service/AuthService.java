package com.careerverse.service;

import com.careerverse.dto.AuthRequest;
import com.careerverse.dto.AuthResponse;
import com.careerverse.model.User;
import com.careerverse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // This is a stubbed service implementation for demonstration.
    // In a real application, this would use Spring Security AuthenticationManager and JwtUtil.
    
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        // Password check goes here...
        
        return new AuthResponse(user, "mock_jwt_token_for_" + user.getId());
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Should be BCrypt hashed
        user.setRole(User.Role.STUDENT);
        
        userRepository.save(user);
        return new AuthResponse(user, "mock_jwt_token_for_" + user.getId());
    }
}
