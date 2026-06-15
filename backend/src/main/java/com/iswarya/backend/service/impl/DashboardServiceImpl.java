package com.iswarya.backend.service.impl;

import java.math.BigDecimal;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.iswarya.backend.dto.DashboardResponse;
import com.iswarya.backend.entity.User;
import com.iswarya.backend.entity.enums.LoanStatus;
import com.iswarya.backend.exception.UserNotFoundException;
import com.iswarya.backend.repository.LoanRepository;
import com.iswarya.backend.repository.UserRepository;
import com.iswarya.backend.service.DashboardService;

@Service
public class DashboardServiceImpl
        implements DashboardService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    public DashboardServiceImpl(
            LoanRepository loanRepository,
            UserRepository userRepository) {

        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DashboardResponse getDashboard() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"));

        long totalLoans =
                loanRepository.countByUser(user);

        long activeLoans =
                loanRepository.countByUserAndStatus(
                        user,
                        LoanStatus.ACTIVE);

        long closedLoans =
                loanRepository.countByUserAndStatus(
                        user,
                        LoanStatus.CLOSED);

        BigDecimal totalLoanAmount =
                loanRepository.getTotalLoanAmount(
                        user);

        BigDecimal activeLoanAmount =
                loanRepository.getLoanAmountByStatus(
                        user,
                        LoanStatus.ACTIVE);

        return DashboardResponse.builder()
                .totalLoans(totalLoans)
                .activeLoans(activeLoans)
                .closedLoans(closedLoans)
                .totalLoanAmount(totalLoanAmount)
                .activeLoanAmount(activeLoanAmount)
                .build();
    }
}