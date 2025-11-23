package br.com.taldoburger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import java.nio.charset.StandardCharsets;
import java.io.InputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class StaticAssetsIntegrationTest {

    @Autowired
    private ResourceLoader resourceLoader;

    @Test
    void applicationContextLoads() {
        assertTrue(true);
    }

    @Test
    void customizationScriptDoesNotRequireBeverageOrFries() throws IOException {
        Resource res = resourceLoader.getResource("classpath:/static/js/customizacao.js");
        assertTrue(res.exists(), "customizacao.js deve existir");
        try (InputStream is = res.getInputStream()) {
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            assertFalse(content.contains("Selecione o tipo de refrigerante."), "Não deve exigir refrigerante");
            assertTrue(content.contains("Selecione um lanche válido."), "Deve validar lanche principal");
        }
    }
}

