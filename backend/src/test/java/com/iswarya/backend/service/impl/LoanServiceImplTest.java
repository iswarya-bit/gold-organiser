package com.iswarya.backend.service.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import org.springframework.security.core.Authentication;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;

import com.iswarya.backend.dto.LoanResponse;
import com.iswarya.backend.dto.RenewLoanRequest;
import com.iswarya.backend.entity.Loan;
import com.iswarya.backend.entity.User;
import com.iswarya.backend.entity.enums.LoanStatus;
import com.iswarya.backend.entity.enums.UserStatus;
import com.iswarya.backend.exception.LoanAlreadyClosedException;
import com.iswarya.backend.exception.UserNotFoundException;
import com.iswarya.backend.repository.LoanRepository;
import com.iswarya.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class LoanServiceImplTest {

        @Mock
        private LoanRepository loanRepository;

        @Mock
        private UserRepository userRepository;

        @InjectMocks
        private LoanServiceImpl loanService;

        // MOCKING REPOSITORY TEST CASE
        @Test
        void shouldMockRepository() {

                when(loanRepository.count())
                                .thenReturn(5L);

                long count = loanRepository.count();

                assertEquals(5L, count);
        }

        // GET LOANS BY STATUS TEST CASES
        @Test
        void getLoansByStatus_ShouldReturnLoans() {

                Authentication authentication = mock(Authentication.class);

                when(authentication.getName())
                                .thenReturn("latchaya@gmail.com");

                SecurityContext context = new SecurityContextImpl();

                context.setAuthentication(authentication);

                SecurityContextHolder.setContext(context);

                User user = User.builder()
                                .id(3L)
                                .name("Latchaya")
                                .email("latchaya@gmail.com")
                                .password("password")
                                .phoneNumber("1234567890")
                                .status(UserStatus.ACTIVE)
                                .build();

                when(userRepository.findByEmail("latchaya@gmail.com"))
                                .thenReturn(Optional.of(user));

                Loan loan = Loan.builder()
                                .id(1L)
                                .bankName("SBI")
                                .branchName("Chennai")
                                .loanAmount(new BigDecimal("500000"))
                                .interestRate(new BigDecimal("8.5"))
                                .pledgeDate(LocalDate.of(2026, 1, 1))
                                .dueDate(LocalDate.of(2027, 1, 1))
                                .status(LoanStatus.ACTIVE)
                                .user(user)
                                .build();

                when(loanRepository.findByUserAndStatus(
                                user,
                                LoanStatus.ACTIVE))
                                .thenReturn(List.of(loan));

                List<LoanResponse> result = loanService.getLoansByStatus(LoanStatus.ACTIVE);

                assertEquals(1, result.size());

                assertEquals("SBI", result.get(0).getBankName());

                assertEquals(LoanStatus.ACTIVE,
                                result.get(0).getStatus());

                verify(userRepository)
                                .findByEmail("latchaya@gmail.com");

                verify(loanRepository)
                                .findByUserAndStatus(user, LoanStatus.ACTIVE);

        }

        @Test
        void getLoansByStatus_ShouldThrowUserNotFoundException() {

                Authentication authentication = mock(Authentication.class);

                when(authentication.getName())
                                .thenReturn("iswarya@gmail.com");

                SecurityContext context = new SecurityContextImpl();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);

                when(userRepository.findByEmail("iswarya@gmail.com"))
                                .thenReturn(Optional.empty());

                assertThrows(
                                UserNotFoundException.class,
                                () -> loanService.getLoansByStatus(LoanStatus.ACTIVE));
        }

        // RENEW LOAN TEST CASES
        @Test
        void renewLoan_ShouldThrowLoanAlreadyClosedException() {

                Authentication authentication = mock(Authentication.class);

                when(authentication.getName())
                                .thenReturn("iswarya@gmail.com");

                SecurityContext context = new SecurityContextImpl();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);

                User user = User.builder()
                                .id(1L)
                                .name("Iswarya")
                                .email("iswarya@gmail.com")
                                .password("password")
                                .phoneNumber("9876543210")
                                .status(UserStatus.ACTIVE)
                                .build();

                when(userRepository.findByEmail("iswarya@gmail.com"))
                                .thenReturn(Optional.of(user));

                Loan loan = Loan.builder()
                                .id(1L)
                                .bankName("SBI")
                                .branchName("Chennai")
                                .loanAmount(new BigDecimal("500000"))
                                .interestRate(new BigDecimal("8.5"))
                                .pledgeDate(LocalDate.of(2026, 1, 1))
                                .dueDate(LocalDate.of(2027, 1, 1))
                                .status(LoanStatus.CLOSED)
                                .user(user)
                                .build();

                when(loanRepository.findByIdAndUser(1L, user))
                                .thenReturn(Optional.of(loan));

                RenewLoanRequest request = new RenewLoanRequest();
                request.setNewDueDate(LocalDate.of(2027, 6, 1));

                assertThrows(
                                LoanAlreadyClosedException.class,
                                () -> loanService.renewLoan(1L, request));

                verify(userRepository)
                                .findByEmail("iswarya@gmail.com");

                verify(loanRepository)
                                .findByIdAndUser(1L, user);

                verify(loanRepository, never())
                                .save(any(Loan.class));
        }

        @Test
        void renewLoan_ShouldRenewLoanSuccessfully() {

                Authentication authentication = mock(Authentication.class);

                when(authentication.getName())
                                .thenReturn("iswarya@gmail.com");

                SecurityContext context = new SecurityContextImpl();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);

                User user = User.builder()
                                .id(1L)
                                .name("Iswarya")
                                .email("iswarya@gmail.com")
                                .password("password")
                                .phoneNumber("9876543210")
                                .status(UserStatus.ACTIVE)
                                .build();

                when(userRepository.findByEmail("iswarya@gmail.com"))
                                .thenReturn(Optional.of(user));

                Loan loan = Loan.builder()
                                .id(1L)
                                .bankName("SBI")
                                .branchName("Chennai")
                                .loanAmount(new BigDecimal("500000"))
                                .interestRate(new BigDecimal("8.5"))
                                .pledgeDate(LocalDate.of(2026, 1, 1))
                                .dueDate(LocalDate.of(2027, 1, 1))
                                .status(LoanStatus.ACTIVE)
                                .user(user)
                                .build();

                when(loanRepository.findByIdAndUser(1L, user))
                                .thenReturn(Optional.of(loan));

                RenewLoanRequest request = new RenewLoanRequest();
                request.setNewDueDate(LocalDate.of(2027, 6, 1));

                when(loanRepository.save(any(Loan.class)))
                                .thenReturn(loan);

                LoanResponse response = loanService.renewLoan(1L, request);

                assertNotNull(response);

                assertEquals(
                                LocalDate.of(2027, 6, 1),
                                response.getDueDate());

                assertEquals(
                                LoanStatus.ACTIVE,
                                response.getStatus());

                verify(userRepository)
                                .findByEmail("iswarya@gmail.com");
                verify(loanRepository)
                                .findByIdAndUser(1L, user);

                // ArgumentCaptor to capture the loan object passed to save method
                ArgumentCaptor<Loan> loanCaptor = ArgumentCaptor.forClass(Loan.class);
                verify(loanRepository, times(1))
                                .save(loanCaptor.capture());
                Loan savedLoan = loanCaptor.getValue();
                assertEquals(LocalDate.of(2027, 6, 1), savedLoan.getDueDate());
                assertEquals(LoanStatus.ACTIVE, savedLoan.getStatus());
                assertEquals(user, savedLoan.getUser());
        }

}
