package com.cpmentor.auth.service;

import com.cpmentor.auth.dto.AuthDTOs.*;
import com.cpmentor.auth.entity.User;
import com.cpmentor.auth.repository.UserRepository;
import com.cpmentor.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
public class AuthService {

    private static final long REMEMBER_ME_EXPIRATION_MILLIS = TimeUnit.DAYS.toMillis(30);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    // @Lazy on AuthenticationManager breaks the cycle:
    // AuthService → @Lazy AuthenticationManager (proxy) → SecurityConfig → JwtAuthFilter → CustomUserDetailsService → UserRepository
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            @Lazy AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return buildResponse(user, token, jwtUtil.getDefaultExpirationMillis());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) userDetailsService.loadUserByUsername(request.getEmail());
        long expirationMillis = request.isRememberMe() ? REMEMBER_ME_EXPIRATION_MILLIS : jwtUtil.getDefaultExpirationMillis();
        String token = jwtUtil.generateToken(user, expirationMillis);
        return buildResponse(user, token, expirationMillis);
    }

    private AuthResponse buildResponse(User user, String token, long expirationMillis) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expirationMillis / 1000)
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
