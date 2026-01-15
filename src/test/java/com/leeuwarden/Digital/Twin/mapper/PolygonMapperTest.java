package com.leeuwarden.Digital.Twin.mapper;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.entity.Soort;
import com.leeuwarden.Digital.Twin.repository.SoortRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PolygonMapperTest {

    @Test
    void toEntity_zetAlleVeldenGoed() {
        // Arrange
        SoortRepository soortRepository = Mockito.mock(SoortRepository.class);
        PolygonMapper mapper = new PolygonMapper(soortRepository);

        Long soortId = 1L;
        Soort soort = new Soort();
        soort.setSoortId(soortId);
        when(soortRepository.findById(soortId)).thenReturn(Optional.of(soort));

        PolygonRequestDTO dto = new PolygonRequestDTO();
        dto.setPointsJson("[[1,2],[3,4]]");
        dto.setOppervlakte("100.0");
        dto.setHoogte(5.0);
        dto.setSoortId(soortId);

        // Act
        Polygon result = mapper.toEntity(dto);

        // Assert
        assertEquals(dto.getPointsJson(), result.getPointsJson());
        assertEquals(dto.getOppervlakte(), result.getOppervlakte());
        assertEquals(dto.getHoogte(), result.getHoogte());
        assertEquals(soort, result.getSoort());
        verify(soortRepository).findById(soortId);
    }

    @Test
    void toEntity_gooitExceptionAlsSoortNietBestaat() {
        SoortRepository soortRepository = Mockito.mock(SoortRepository.class);
        PolygonMapper mapper = new PolygonMapper(soortRepository);

        Long soortId = 99L;
        when(soortRepository.findById(soortId)).thenReturn(Optional.empty());

        PolygonRequestDTO dto = new PolygonRequestDTO();
        dto.setSoortId(soortId);

        assertThrows(IllegalArgumentException.class, () -> mapper.toEntity(dto));
    }

    @Test
    void updateEntityFromDto_pastAlleOptioneleVeldenAan() {
        SoortRepository soortRepository = Mockito.mock(SoortRepository.class);
        PolygonMapper mapper = new PolygonMapper(soortRepository);

        Long soortId = 2L;
        Soort soort = new Soort();
        soort.setSoortId(soortId);
        when(soortRepository.findById(soortId)).thenReturn(Optional.of(soort));

        PolygonRequestDTO dto = new PolygonRequestDTO();
        dto.setPointsJson("[[10,20]]");
        dto.setOppervlakte("50.0");
        dto.setHoogte(3.0);
        dto.setSoortId(soortId);

        Polygon polygon = new Polygon();
        polygon.setPointsJson("[[old]]");
        polygon.setOppervlakte("1.0");
        polygon.setHoogte(1.0);

        mapper.updateEntityFromDto(dto, polygon);

        assertEquals(dto.getPointsJson(), polygon.getPointsJson());
        assertEquals(dto.getOppervlakte(), polygon.getOppervlakte());
        assertEquals(dto.getHoogte(), polygon.getHoogte());
        assertEquals(soort, polygon.getSoort());
    }

}
