package com.iswarya.backend.service.impl;

import com.iswarya.backend.dto.AuthResponse;
import com.iswarya.backend.dto.LoginRequest;
import com.iswarya.backend.dto.RegisterRequest;
import com.iswarya.backend.entity.User;
import com.iswarya.backend.entity.enums.UserStatus;
import com.iswarya.backend.repository.UserRepository;
import com.iswarya.backend.service.AuthService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;

        public AuthServiceImpl(
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {

                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public AuthResponse register(RegisterRequest request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                String encodedPassword = passwordEncoder.encode(request.getPassword());

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(encodedPassword)
                                .phoneNumber(request.getPhoneNumber())
                                .status(UserStatus.ACTIVE)
                                .build();

                userRepository.save(user);

                return new AuthResponse(
                                "User registered successfully",
                                null);
        }

        @Override
        public AuthResponse login(LoginRequest request) {

                User user = userRepository
                                .findByEmail(request.getEmail())
                                .orElseThrow(
                                                () -> new RuntimeException(
                                                                "Invalid email or password"));

                boolean matches = passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword());

                if (!matches) {
                        throw new RuntimeException(
                                        "Invalid email or password");
                }

                return new AuthResponse(
                                "Login successful",
                                null);
        }
}