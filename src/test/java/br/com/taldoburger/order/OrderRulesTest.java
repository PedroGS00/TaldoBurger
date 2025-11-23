package br.com.taldoburger.order;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderRulesTest {

    static class OrderState {
        String lancheName;
        Double lanchePrice;
        String batataTamanho; // opcional
        boolean batataCheddar; // opcional
        boolean batataBacon; // opcional
        String refrigeranteTipo; // opcional
    }

    private boolean isOrderValid(OrderState state) {
        return state != null && state.lancheName != null && !state.lancheName.isBlank() && state.lanchePrice != null;
    }

    @Test
    void orderIsValidWithOnlyLanche() {
        OrderState s = new OrderState();
        s.lancheName = "Taldo Classic";
        s.lanchePrice = 25.0;
        assertTrue(isOrderValid(s));
    }

    @Test
    void orderIsInvalidWithoutLanche() {
        OrderState s = new OrderState();
        s.lancheName = null;
        s.lanchePrice = null;
        s.refrigeranteTipo = "Coca-Cola";
        assertFalse(isOrderValid(s));
    }

    @Test
    void orderIsValidWithComplementsByChoice() {
        OrderState s = new OrderState();
        s.lancheName = "Taldo Bacon";
        s.lanchePrice = 32.5;
        s.batataTamanho = "grande";
        s.batataCheddar = true;
        s.refrigeranteTipo = "Guaraná Antarctica";
        assertTrue(isOrderValid(s));
    }
}

