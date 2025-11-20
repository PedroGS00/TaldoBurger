package br.com.taldoburger.controller;

import br.com.taldoburger.dto.UserRequestDTO;
import br.com.taldoburger.dto.UserResponseDTO;
import br.com.taldoburger.model.User;
import br.com.taldoburger.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerUserReturnsCreated() throws Exception {
        UserRequestDTO dto = new UserRequestDTO("John", "john", "john@example.com", "secret");
        User saved = new User();
        saved.setId(1L);
        saved.setName("John");
        saved.setUsername("john");
        saved.setEmail("john@example.com");
        when(userService.registerUser(dto)).thenReturn(saved);

        mockMvc.perform(post("/users/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.username").value("john"));
    }

    @Test
    void loginReturnsOkWhenAuthenticated() throws Exception {
        User input = new User();
        input.setUsername("john");
        input.setPassword("secret");
        User auth = new User();
        auth.setId(1L);
        auth.setUsername("john");
        when(userService.authenticateUser("john", "secret")).thenReturn(auth);

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void loginReturnsUnauthorizedWhenInvalid() throws Exception {
        User input = new User();
        input.setUsername("john");
        input.setPassword("wrong");
        when(userService.authenticateUser("john", "wrong")).thenReturn(null);

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllUsersReturnsOk() throws Exception {
        UserResponseDTO u = new UserResponseDTO(1L, "John", "john", "john@example.com", User.UserRole.USER);
        when(userService.getAllUsers()).thenReturn(List.of(u));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("john"));
    }

    @Test
    void deleteUserNoContentWhenDeleted() throws Exception {
        when(userService.deleteUser(1L)).thenReturn(true);
        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteUserNotFoundWhenMissing() throws Exception {
        when(userService.deleteUser(1L)).thenReturn(false);
        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUserBadRequestOnException() throws Exception {
        when(userService.deleteUser(1L)).thenThrow(new RuntimeException("err"));
        mockMvc.perform(delete("/users/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateUserOkWhenUpdated() throws Exception {
        User input = new User();
        input.setName("N");
        input.setUsername("john");
        input.setEmail("j@e.com");
        User updated = new User();
        updated.setId(1L);
        updated.setUsername("john");
        when(userService.updateUser(eq(1L), any(User.class))).thenReturn(updated);

        mockMvc.perform(put("/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void updateUserNotFoundWhenNull() throws Exception {
        User input = new User();
        when(userService.updateUser(eq(1L), any(User.class))).thenReturn(null);

        mockMvc.perform(put("/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateUserBadRequestOnException() throws Exception {
        User input = new User();
        when(userService.updateUser(eq(1L), any(User.class))).thenThrow(new RuntimeException("bad"));

        mockMvc.perform(put("/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isBadRequest());
    }
}