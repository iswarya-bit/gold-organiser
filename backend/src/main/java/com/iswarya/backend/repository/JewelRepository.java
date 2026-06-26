package com.iswarya.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iswarya.backend.entity.Jewel;
import com.iswarya.backend.entity.Loan;

public interface JewelRepository
        extends JpaRepository<Jewel, Long> {

    List<Jewel> findByLoan(Loan loan);

    Optional<Jewel> findByIdAndLoan(
        Long id,
        Loan loan);
}