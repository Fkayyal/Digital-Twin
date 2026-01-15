package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.entity.Soort;
import com.leeuwarden.Digital.Twin.repository.SoortRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SoortControllerTest {

    private final SoortRepository soortRepository = mock(SoortRepository.class);
    private final SoortController controller = new SoortController(soortRepository);

    @Test
    void getAll_geeftLijstVanRepositoryTerug() {
        // Arrange
        Soort s1 = new Soort();
        Soort s2 = new Soort();
        List<Soort> list = Arrays.asList(s1, s2);
        when(soortRepository.findAll()).thenReturn(list);

        // Act
        List<Soort> result = controller.getAll();

        // Assert
        assertEquals(list, result);
        verify(soortRepository).findAll();
    }

    @Test
    void updateSoort_bestaatNiet_geeftNotFound() {
        // Arrange
        Long id = 1L;
        Soort update = new Soort();
        when(soortRepository.existsById(id)).thenReturn(false);

        // Act
        ResponseEntity<Soort> response = controller.updateSoort(id, update);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(soortRepository).existsById(id);
        verify(soortRepository, never()).save(any());
    }

    @Test
    void updateSoort_bestaatWel_updateEnSave() {
        // Arrange
        Long id = 2L;
        Soort update = new Soort();
        update.setNaam("nieuw");
        when(soortRepository.existsById(id)).thenReturn(true);

        Soort saved = new Soort();
        saved.setSoortId(id);
        when(soortRepository.save(update)).thenReturn(saved);

        // Act
        ResponseEntity<Soort> response = controller.updateSoort(id, update);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(saved, response.getBody());
        assertEquals(id, update.getSoortId());
        verify(soortRepository).existsById(id);
        verify(soortRepository).save(update);
    }
}