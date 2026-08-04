package com.cpmentor.worksheet.repository;

import com.cpmentor.worksheet.entity.Worksheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorksheetRepository extends JpaRepository<Worksheet, Long> {
    List<Worksheet> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}
