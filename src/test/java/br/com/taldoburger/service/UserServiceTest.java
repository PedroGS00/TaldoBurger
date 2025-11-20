package br.com.taldoburger.service;

import br.com.taldoburger.dto.UserRequestDTO;
import br.com.taldoburger.dto.UserResponseDTO;
import br.com.taldoburger.model.User;
import br.com.taldoburger.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("John Doe");
        sampleUser.setUsername("john");
        sampleUser.setEmail("john@example.com");
        sampleUser.setPassword("secret");
        sampleUser.setRole(User.UserRole.USER);
    }

    @Test
    void registerUserThrowsWhenPasswordNull() {
        UserRequestDTO dto = new UserRequestDTO("John", "john", "john@example.com", null);
        assertThrows(IllegalAccessError.class, () -> userService.registerUser(dto));
    }

    @Test
    void registerUserSavesAndReturnsUser() {
        UserRequestDTO dto = new UserRequestDTO("John", "john", "john@example.com", "secret");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });
        User saved = userService.registerUser(dto);
        assertNotNull(saved.getId());
        assertEquals("john", saved.getUsername());
        assertEquals(User.UserRole.USER, saved.getRole());
    }

    @Test
    void getAllUsersMapsToDto() {
        User u1 = new User();
        u1.setId(1L);
        u1.setName("A");
        u1.setUsername("a");
        u1.setEmail("a@e.com");
        u1.setRole(User.UserRole.ADMIN);

        when(userRepository.findAll()).thenReturn(List.of(u1, sampleUser));
        List<UserResponseDTO> dtos = userService.getAllUsers();
        assertEquals(2, dtos.size());
        assertEquals("A", dtos.get(0).name());
        assertEquals(User.UserRole.ADMIN, dtos.get(0).role());
        assertEquals("john", dtos.get(1).username());
    }

    @Test
    void createUserThrowsWhenUsernameExists() {
        when(userRepository.findByUsername("john")).thenReturn(sampleUser);
        User input = new User();
        input.setUsername("john");
        input.setEmail("new@example.com");
        assertThrows(RuntimeException.class, () -> userService.createUser(input));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUserThrowsWhenEmailExists() {
        when(userRepository.findByUsername("new")).thenReturn(null);
        when(userRepository.findByEmail("john@example.com")).thenReturn(sampleUser);
        User input = new User();
        input.setUsername("new");
        input.setEmail("john@example.com");
        assertThrows(RuntimeException.class, () -> userService.createUser(input));
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUserSetsDefaultRoleWhenNull() {
        when(userRepository.findByUsername("new")).thenReturn(null);
        when(userRepository.findByEmail("new@example.com")).thenReturn(null);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        User input = new User();
        input.setUsername("new");
        input.setEmail("new@example.com");
        User created = userService.createUser(input);
        assertEquals(User.UserRole.USER, created.getRole());
    }

    @Test
    void updateUserReturnsNullWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        User updated = new User();
        assertNull(userService.updateUser(99L, updated));
    }

    @Test
    void updateUserThrowsWhenUsernameTakenByOther() {
        User existing = new User();
        existing.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        User other = new User();
        other.setId(2L);
        other.setUsername("taken");
        when(userRepository.findByUsername("taken")).thenReturn(other);
        User updated = new User();
        updated.setUsername("taken");
        updated.setEmail("x@y.com");
        assertThrows(RuntimeException.class, () -> userService.updateUser(1L, updated));
    }

    @Test
    void updateUserThrowsWhenEmailTakenByOther() {
        User existing = new User();
        existing.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        User other = new User();
        other.setId(2L);
        other.setEmail("taken@example.com");
        when(userRepository.findByEmail("taken@example.com")).thenReturn(other);
        User updated = new User();
        updated.setUsername("new");
        updated.setEmail("taken@example.com");
        assertThrows(RuntimeException.class, () -> userService.updateUser(1L, updated));
    }

    @Test
    void updateUserUpdatesFieldsAndSaves() {
        User existing = new User();
        existing.setId(1L);
        existing.setPassword("old");
        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.findByUsername("newuser")).thenReturn(null);
        when(userRepository.findByEmail("new@example.com")).thenReturn(null);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = new User();
        updated.setName("New Name");
        updated.setUsername("newuser");
        updated.setEmail("new@example.com");
        updated.setPassword("newpass");
        updated.setRole(User.UserRole.ADMIN);

        User result = userService.updateUser(1L, updated);
        assertEquals("New Name", result.getName());
        assertEquals("newuser", result.getUsername());
        assertEquals("new@example.com", result.getEmail());
        assertEquals("newpass", result.getPassword());
        assertEquals(User.UserRole.ADMIN, result.getRole());
    }

    @Test
    void deleteUserReturnsFalseWhenNotFound() {
        when(userRepository.findById(9L)).thenReturn(Optional.empty());
        assertFalse(userService.deleteUser(9L));
    }

    @Test
    void deleteUserThrowsWhenRoot() {
        User root = new User();
        root.setId(1L);
        root.setUsername("root");
        when(userRepository.findById(1L)).thenReturn(Optional.of(root));
        assertThrows(RuntimeException.class, () -> userService.deleteUser(1L));
    }

    @Test
    void deleteUserDeletesWhenValid() {
        User u = new User();
        u.setId(2L);
        u.setUsername("john");
        when(userRepository.findById(2L)).thenReturn(Optional.of(u));
        boolean deleted = userService.deleteUser(2L);
        assertTrue(deleted);
        verify(userRepository).deleteById(2L);
    }

    @Test
    void authenticateUserReturnsUserWhenPasswordMatches() {
        when(userRepository.findByUsername("john")).thenReturn(sampleUser);
        assertNotNull(userService.authenticateUser("john", "secret"));
    }

    @Test
    void authenticateUserReturnsNullWhenInvalid() {
        when(userRepository.findByUsername("john")).thenReturn(sampleUser);
        assertNull(userService.authenticateUser("john", "wrong"));
    }

    @Test
    void loadUserByUsernameReturnsDetails() {
        when(userRepository.findByUsername("john")).thenReturn(sampleUser);
        UserDetails details = userService.loadUserByUsername("john");
        assertEquals("john", details.getUsername());
    }

    @Test
    void loadUserByUsernameThrowsWhenNotFound() {
        when(userRepository.findByUsername("missing")).thenReturn(null);
        assertThrows(UsernameNotFoundException.class, () -> userService.loadUserByUsername("missing"));
    }
}