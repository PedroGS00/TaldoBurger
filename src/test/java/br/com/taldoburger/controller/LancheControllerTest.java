package br.com.taldoburger.controller;

import br.com.taldoburger.dto.LancheResponseDTO;
import br.com.taldoburger.model.Lanche;
import br.com.taldoburger.service.LancheService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LancheController.class)
@AutoConfigureMockMvc(addFilters = false)
class LancheControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LancheService lancheService;

    @Test
    void createLancheMultipartReturnsCreated() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "x.png", "image/png", new byte[]{1});
        LancheResponseDTO dto = new LancheResponseDTO(1L, "N", "D", 10.0, 5, "x.png");
        when(lancheService.saveImg(any(), eq("N"), eq("D"), eq(10.0), eq(5))).thenReturn(dto);

        mockMvc.perform(multipart("/lanches")
                        .file(file)
                        .param("nome", "N")
                        .param("descricao", "D")
                        .param("preco", "10.0")
                        .param("estoque", "5")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.imagePath").value("x.png"));
    }

    @Test
    void getAllLanchesReturnsOk() throws Exception {
        LancheResponseDTO dto = new LancheResponseDTO(1L, "N", "D", 10.0, 5, "x.png");
        when(lancheService.findAllLanches()).thenReturn(List.of(dto));

        mockMvc.perform(get("/lanches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("N"));
    }

    @Test
    void getByIdReturnsOkWhenFound() throws Exception {
        Lanche l = new Lanche();
        l.setId(1L);
        l.setNome("N");
        when(lancheService.findLancheById(1L)).thenReturn(Optional.of(l));

        mockMvc.perform(get("/lanches/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void getByIdReturnsNotFoundWhenMissing() throws Exception {
        when(lancheService.findLancheById(1L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/lanches/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateLancheReturnsOk() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "x2.png", "image/png", new byte[]{1});
        LancheResponseDTO dto = new LancheResponseDTO(1L, "N2", "D2", 11.0, 6, "x2.png");
        when(lancheService.updateLancheWithImage(eq(1L), any(), eq("N2"), eq("D2"), eq(11.0), eq(6))).thenReturn(dto);

        mockMvc.perform(multipart("/lanches/1")
                        .file(file)
                        .param("nome", "N2")
                        .param("descricao", "D2")
                        .param("preco", "11.0")
                        .param("estoque", "6")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagePath").value("x2.png"));
    }

    @Test
    void updateLancheReturnsNotFoundOnError() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "x3.png", "image/png", new byte[]{1});
        when(lancheService.updateLancheWithImage(eq(1L), any(), eq("N3"), eq("D3"), eq(12.0), eq(7)))
                .thenThrow(new RuntimeException("missing"));
        mockMvc.perform(multipart("/lanches/1")
                        .file(file)
                        .param("nome", "N3")
                        .param("descricao", "D3")
                        .param("preco", "12.0")
                        .param("estoque", "7")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteLancheReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/lanches/1"))
                .andExpect(status().isNoContent());
        verify(lancheService).deleteLanche(1L);
    }
}