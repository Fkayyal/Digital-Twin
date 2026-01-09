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

    @Override
    public PolygonRequestDTO toDTO(Polygon polygon) {
        return null;
    }

}
