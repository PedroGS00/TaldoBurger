package br.com.taldoburger.service;

import br.com.taldoburger.dto.LancheResponseDTO;
import br.com.taldoburger.model.Lanche;
import br.com.taldoburger.repository.LancheRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LancheServiceTest {

    @Mock
    private LancheRepository lancheRepository;

    @InjectMocks
    private LancheService lancheService;

    @Test
    void saveImgThrowsWhenFileEmpty() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);
        assertThrows(RuntimeException.class, () -> lancheService.saveImg(file, "n", "d", 1.0, 1));
        verify(lancheRepository, never()).save(any());
    }

    @Test
    void saveImgReusesExistingImage() {
        String existing = "logo.png";
        Path imgPath = Path.of("src/main/resources/static/img").resolve(existing);
        assertTrue(Files.exists(imgPath));

        MockMultipartFile file = new MockMultipartFile("file", existing, "image/png", new byte[]{1,2,3});
        when(lancheRepository.save(any(Lanche.class))).thenAnswer(invocation -> {
            Lanche l = invocation.getArgument(0);
            l.setId(100L);
            return l;
        });

        LancheResponseDTO dto = lancheService.saveImg(file, "Nome", "Desc", 10.0, 5);
        assertEquals(existing, dto.imagePath());
        assertEquals(100L, dto.id());
    }

    @Test
    void saveImgCopiesNewImage() {
        String name = "test_upload.png";
        Path dest = Path.of("src/main/resources/static/img").resolve(name);
        try { Files.deleteIfExists(dest); } catch (Exception ignored) {}

        MockMultipartFile file = new MockMultipartFile("file", name, "image/png", new byte[]{9,9,9});
        when(lancheRepository.save(any(Lanche.class))).thenAnswer(invocation -> invocation.getArgument(0));
        LancheResponseDTO dto = lancheService.saveImg(file, "N", "D", 5.0, 2);
        assertEquals(name, dto.imagePath());
        assertTrue(Files.exists(dest));
        try { Files.deleteIfExists(dest); } catch (Exception ignored) {}
    }

    @Test
    void updateThrowsWhenMissing() {
        when(lancheRepository.findById(99L)).thenReturn(Optional.empty());
        MockMultipartFile file = new MockMultipartFile("file", "x.png", "image/png", new byte[]{1});
        assertThrows(RuntimeException.class, () -> lancheService.updateLancheWithImage(99L, file, "n", "d", 1.0, 1));
        verify(lancheRepository, never()).save(any());
    }

    @Test
    void updateWithoutFileKeepsImagePath() {
        Lanche existing = new Lanche();
        existing.setId(1L);
        existing.setImagePath("old.png");
        when(lancheRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(lancheRepository.save(any(Lanche.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LancheResponseDTO dto = lancheService.updateLancheWithImage(1L, null, "n", "d", 1.5, 3);
        assertEquals("old.png", dto.imagePath());
        assertEquals("n", dto.nome());
        assertEquals(3, dto.estoque());
    }

    @Test
    void updateWithNewFileChangesImagePath() {
        Lanche existing = new Lanche();
        existing.setId(2L);
        existing.setImagePath("old.png");
        when(lancheRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(lancheRepository.save(any(Lanche.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String name = "updated_upload.png";
        Path dest = Path.of("src/main/resources/static/img").resolve(name);
        try { Files.deleteIfExists(dest); } catch (Exception ignored) {}

        MockMultipartFile file = new MockMultipartFile("file", name, "image/png", new byte[]{7,7});
        LancheResponseDTO dto = lancheService.updateLancheWithImage(2L, file, "n2", "d2", 2.0, 4);
        assertEquals(name, dto.imagePath());
        assertTrue(Files.exists(dest));
        try { Files.deleteIfExists(dest); } catch (Exception ignored) {}
    }

    @Test
    void findAllMapsToDto() {
        Lanche l = new Lanche();
        l.setId(3L);
        l.setNome("X");
        l.setDescricao("Y");
        l.setPreco(3.5);
        l.setEstoque(10);
        l.setImagePath("x.png");
        when(lancheRepository.findAll()).thenReturn(List.of(l));
        List<LancheResponseDTO> list = lancheService.findAllLanches();
        assertEquals(1, list.size());
        assertEquals("X", list.get(0).nome());
        assertEquals("x.png", list.get(0).imagePath());
    }
}