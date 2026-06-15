package com.iswarya.backend.repository;

import com.iswarya.backend.entity.Loan;
import com.iswarya.backend.entity.User;
import com.iswarya.backend.entity.enums.LoanStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LoanRepository
        extends JpaRepository<Loan, Long> {

    List<Loan> findByUser(User user);

    Optional<Loan> findByIdAndUser(
            Long id,
            User user);

    List<Loan> findByUserAndStatus(
            User user,
            LoanStatus status);

    long countByUser(User user);

    long countByUserAndStatus(
            User user,
            LoanStatus status);

    @Query("""
            SELECT COALESCE(SUM(l.loanAmount), 0)
            FROM Loan l
            WHERE l.user = :user
            """)
    BigDecimal getTotalLoanAmount(
            @Param("user") User user);

    @Query("""
            SELECT COALESCE(SUM(l.loanAmount), 0)
            FROM Loan l
            WHERE l.user = :user
            AND l.status = :status
            """)
    BigDecimal getLoanAmountByStatus(
            @Param("user") User user,
            @Param("status") LoanStatus status);
}