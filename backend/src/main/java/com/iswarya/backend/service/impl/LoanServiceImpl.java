package com.iswarya.backend.service.impl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import com.iswarya.backend.dto.LoanRequest;
import com.iswarya.backend.dto.LoanResponse;
import com.iswarya.backend.dto.UpdateLoanRequest;
import com.iswarya.backend.entity.Loan;
import com.iswarya.backend.entity.User;
import com.iswarya.backend.entity.enums.LoanStatus;
import com.iswarya.backend.exception.LoanNotFoundException;
import com.iswarya.backend.exception.UserNotFoundException;
import com.iswarya.backend.repository.LoanRepository;
import com.iswarya.backend.repository.UserRepository;
import com.iswarya.backend.service.LoanService;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanServiceImpl implements LoanService {

        private final LoanRepository loanRepository;
        private final UserRepository userRepository;

        public LoanServiceImpl(
                        LoanRepository loanRepository,
                        UserRepository userRepository) {
                this.loanRepository = loanRepository;
                this.userRepository = userRepository;
        }

        @Override
        public LoanResponse createLoan(
                        LoanRequest request) {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                Loan loan = Loan.builder()
                                .bankName(request.getBankName())
                                .branchName(request.getBranchName())
                                .loanAmount(request.getLoanAmount())
                                .interestRate(request.getInterestRate())
                                .pledgeDate(request.getPledgeDate())
                                .dueDate(request.getDueDate())
                                .status(LoanStatus.ACTIVE)
                                .user(user)
                                .build();

                Loan savedLoan = loanRepository.save(loan);

                return mapToResponse(savedLoan);
        }

        @Override
        public List<LoanResponse> getMyLoans() {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                List<Loan> loans = loanRepository.findByUser(user);

                return loans.stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public LoanResponse getLoanById(
                        Long id) {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                Loan loan = loanRepository
                                .findByIdAndUser(id, user)
                                .orElseThrow(() -> new LoanNotFoundException(
                                                "Loan not found"));

                return mapToResponse(loan);
        }

        @Override
        public LoanResponse updateLoan(
                        Long id,
                        UpdateLoanRequest request) {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                Loan loan = loanRepository
                                .findByIdAndUser(id, user)
                                .orElseThrow(() -> new LoanNotFoundException(
                                                "Loan not found"));

                loan.setBranchName(
                                request.getBranchName());

                loan.setInterestRate(
                                request.getInterestRate());

                loan.setDueDate(
                                request.getDueDate());

                Loan updatedLoan = loanRepository.save(loan);

                return mapToResponse(updatedLoan);
        }

        @Override
        public LoanResponse closeLoan(Long id) {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                Loan loan = loanRepository
                                .findByIdAndUser(id, user)
                                .orElseThrow(() -> new LoanNotFoundException(
                                                "Loan not found"));

                loan.setStatus(LoanStatus.CLOSED);

                loan.setClosedDate(
                                LocalDate.now());

                Loan savedLoan = loanRepository.save(loan);

                return mapToResponse(savedLoan);
        }

        @Override
        public List<LoanResponse> getLoansByStatus(
                        LoanStatus status) {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String email = authentication.getName();

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                List<Loan> loans = loanRepository.findByUserAndStatus(
                                user,
                                status);

                return loans.stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        private LoanResponse mapToResponse(
                        Loan loan) {

                return LoanResponse.builder()
                                .id(loan.getId())
                                .bankName(loan.getBankName())
                                .branchName(loan.getBranchName())
                                .loanAmount(loan.getLoanAmount())
                                .interestRate(loan.getInterestRate())
                                .pledgeDate(loan.getPledgeDate())
                                .dueDate(loan.getDueDate())
                                .status(loan.getStatus())
                                .build();
        }
}