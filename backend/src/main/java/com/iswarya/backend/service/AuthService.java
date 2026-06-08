package com.iswarya.backend.service;

import com.iswarya.backend.dto.AuthResponse;
import com.iswarya.backend.dto.LoginRequest;
import com.iswarya.backend.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}