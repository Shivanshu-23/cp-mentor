package com.cpmentor.config;

import com.cpmentor.auth.filter.JwtAuthFilter;
import com.cpmentor.auth.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService; // ← specific class, not UserDetailsService interface

    @Value("${cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/problems/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/ai/**").permitAll()
                .requestMatchers("/api/v1/daily-challenge/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/company-problems", "/api/v1/company-problems/**").permitAll()
                // /me is public here too — it self-enforces auth in the controller (returns
                // 401 if @AuthenticationPrincipal is null) rather than at this layer, because
                // JwtAuthFilter always populates the security context when a valid Bearer
                // token is present regardless of permitAll, and "/me" vs "/{username}" can't
                // be told apart by an ant-pattern matcher.
                .requestMatchers(HttpMethod.GET, "/api/v1/leetcode-stats", "/api/v1/leetcode-stats/**").permitAll()
                // Public reference-data GETs only — do NOT widen this to "/api/v1/method/**".
                // Private per-user resources (sessions, triggers, stats) live under the same
                // /api/v1/method prefix and must fall through to .anyRequest().authenticated().
                .requestMatchers(HttpMethod.GET, "/api/v1/method/patterns", "/api/v1/method/patterns/**",
                        "/api/v1/method/resources").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/method/analyze-constraints", "/api/v1/method/edge-cases").permitAll()
                // v2 Phase E — static/seeded reference content, no writes, safe to permitAll.
                // NOTE: "/api/v1/method/triggers/dictionary" is an EXACT path, not a wildcard —
                // "/api/v1/method/triggers" (no suffix) is the private, JWT-gated Phase 5 user
                // trigger log and must never be swept into this rule.
                .requestMatchers(HttpMethod.GET, "/api/v1/method/phases", "/api/v1/method/complexity-budget",
                        "/api/v1/method/moves", "/api/v1/method/rungs", "/api/v1/method/recovery-steps",
                        "/api/v1/method/topics", "/api/v1/method/script", "/api/v1/method/triggers/dictionary").permitAll()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
