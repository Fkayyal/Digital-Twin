package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.mapper.PolygonMapper;
import com.leeuwarden.Digital.Twin.repository.PolygonRepository;
import com.leeuwarden.Digital.Twin.service.PolygonStatisticsService;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PolygonControllerTest {

    private final PolygonRepository polygonRepository = mock(PolygonRepository.class);
    private final PolygonMapper polygonMapper = mock(PolygonMapper.class);
    private final PolygonStatisticsService polygonStatisticsService = mock(PolygonStatisticsService.class);
    private final PolygonController controller = new PolygonController(polygonRepository, polygonMapper,  polygonStatisticsService);

    @Test
    void createPolygon_gebruiktMapperEnSave() {
        // Arrange
        PolygonRequestDTO dto = new PolygonRequestDTO();
        dto.setPointsJson("[[1,2],[3,4]]");
        dto.setOppervlakte("100.0");
        dto.setHoogte(5.0);
        dto.setSoortId(1L);

        Polygon mapped = new Polygon();
        Polygon saved = new Polygon();
        saved.setId(10L);

        when(polygonMapper.toEntity(dto)).thenReturn(mapped);
        when(polygonRepository.save(mapped)).thenReturn(saved);

        // Act
        Polygon result = controller.createPolygon(dto);

        // Assert
        assertEquals(saved, result);
        verify(polygonMapper).toEntity(dto);
        verify(polygonRepository).save(mapped);
    }

    @Test
    void getPolygons_geeftLijstVanRepositoryTerug() {
        // Arrange
        Polygon p1 = new Polygon();
        Polygon p2 = new Polygon();
        List<Polygon> list = Arrays.asList(p1, p2);
        when(polygonRepository.findAll()).thenReturn(list);

        // Act
        List<Polygon> result = controller.getPolygons();

        // Assert
        assertEquals(list, result);
        verify(polygonRepository).findAll();
    }

    @Test
    void getPolygon_haaltPolygonOpMetJuisteId() {
        // Arrange
        Long id = 5L;
        Polygon p = new Polygon();
        p.setId(id);
        when(polygonRepository.findById(id)).thenReturn(Optional.of(p));

        // Act
        Polygon result = controller.getPolygon(id);

        // Assert
        assertEquals(p, result);
        verify(polygonRepository).findById(id);
    }

    @Test
    void updatePolygon_gebruiktFindByIdMapperEnSave() {
        // Arrange
        Long id = 7L;
        Polygon bestaande = new Polygon();
        bestaande.setId(id);
        when(polygonRepository.findById(id)).thenReturn(Optional.of(bestaande));

        PolygonRequestDTO dto = new PolygonRequestDTO();
        dto.setHoogte(10.0);

        Polygon saved = new Polygon();
        saved.setId(id);
        when(polygonRepository.save(bestaande)).thenReturn(saved);

        // Act
        Polygon result = controller.updatePolygon(id, dto);

        // Assert
        assertEquals(saved, result);
        verify(polygonRepository).findById(id);
        verify(polygonMapper).updateEntityFromDto(dto, bestaande);
        verify(polygonRepository).save(bestaande);
    }

    @Test
    void deletePolygon_gebruiktDeleteById() {
        // Arrange
        Long id = 3L;

        // Act
        controller.deletePolygon(id);

        // Assert
        verify(polygonRepository).deleteById(id);
    }
}
