package com.iswarya.backend.entity;

import com.iswarya.backend.entity.enums.LoanStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bankName;

    private String branchName;

    @Column(nullable = false)
    private BigDecimal loanAmount;

    @Column(nullable = false)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private LocalDate pledgeDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    private LocalDate renewalDate;

    private LocalDate closedDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}