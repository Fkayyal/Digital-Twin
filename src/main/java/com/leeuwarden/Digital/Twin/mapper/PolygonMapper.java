package com.leeuwarden.Digital.Twin.mapper;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.entity.Soort;
import com.leeuwarden.Digital.Twin.repository.PolygonRepository;
import com.leeuwarden.Digital.Twin.repository.SoortRepository;
import org.springframework.stereotype.Component;
// Deze Mapper klasse zet PolygonRequestDTO om naar een Polygon entity
// de @Component zorgt ervoor dat deze klasse door Spring wordt beheerd
// @Component markeert deze klasse als Spring-Bean, zodat we hem kunnen injecteren in de controller
@Component
public class PolygonMapper implements Mapper<PolygonRequestDTO, Polygon>{

    private final SoortRepository soortRepository;

    public PolygonMapper(SoortRepository soortRepository) {
        this.soortRepository = soortRepository;
    }

    // Maakt van de DTO een nieuw Polygon-object met dezelfde data
    @Override
    public Polygon toEntity(PolygonRequestDTO polygonRequestDTO) {
        Polygon polygon = new Polygon();
        polygon.setPointsJson(polygonRequestDTO.getPointsJson());
        polygon.setOppervlakte(polygonRequestDTO.getOppervlakte());
        polygon.setHoogte(polygonRequestDTO.getHoogte());

        Soort soort = soortRepository.findById(polygonRequestDTO.getSoortId())
                .orElseThrow(() -> new IllegalArgumentException("Soort niet gevonden: " + polygonRequestDTO.getSoortId()));
        polygon.setSoort(soort);

        return polygon;
    }

    public void updateEntityFromDto(PolygonRequestDTO dto, Polygon polygon) {
        if (dto.getPointsJson() != null) {
            polygon.setPointsJson(dto.getPointsJson());
        }
        if (dto.getOppervlakte() != null) {
            polygon.setOppervlakte(dto.getOppervlakte());
        }
        // hoogte kun je altijd zetten, of ook optioneel maken met een Double in de DTO
        polygon.setHoogte(dto.getHoogte());

        if (dto.getSoortId() != null) {
            Soort soort = soortRepository.findById(dto.getSoortId())
                    .orElseThrow(() -> new IllegalArgumentException("Soort niet gevonden: " + dto.getSoortId()));
            polygon.setSoort(soort);
        }
    }

    @Override
    public PolygonRequestDTO toDTO(Polygon polygon) {
        return null;
    }

}
