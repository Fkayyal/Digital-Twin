package com.leeuwarden.Digital.Twin.service;

import com.leeuwarden.Digital.Twin.DTO.PolygonStatsDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.entity.Soort;
import org.springframework.stereotype.Service;

@Service
public class PolygonStatisticsService {

    public PolygonStatsDTO calculate(Polygon polygon) {
        Soort soort = polygon.getSoort();

        if (soort == null) {
            PolygonStatsDTO dto = new PolygonStatsDTO();
            dto.setPolygonId(polygon.getId());
            dto.setAantalEenheden(0);
            dto.setTotaleKosten(0);
            dto.setTotaleOpbrengst(0);
            dto.setAantalMensen(0);
            dto.setLeefbaarheidPunten(0);
            return dto;
        }

        // Oppervlakte als String → naar double
        double oppervlakte = 0.0;
        String oppStr = polygon.getOppervlakte();

        if (oppStr != null && !oppStr.isBlank()) {
            String numeric = oppStr.replaceAll("[^0-9.]", ""); // laat alleen cijfers en punt over
            if (!numeric.isBlank()) {
                try {
                    oppervlakte = Double.parseDouble(numeric);
                } catch (NumberFormatException e) {
                    System.out.println("Kan oppervlakte niet parsen voor polygon " + polygon.getId()
                            + " oppStr='" + oppStr + "' numeric='" + numeric + "'");
                }
            }
        }
        double hoogte = polygon.getHoogte();

        String eenheidstype = soort.getEenheidstype(); // "M2" of "M3"

        System.out.println("Polygon " + polygon.getId()
                + " soort=" + (soort != null ? soort.getNaam() : "null")
                + " oppStr='" + oppStr + "'"
                + " eenheidstype=" + eenheidstype
                + " oppervlakte=" + oppervlakte
                + " hoogte=" + hoogte);

        double aantalEenheden;
        if ("M2".equalsIgnoreCase(eenheidstype)) {
            aantalEenheden = oppervlakte;
        } else if ("M3".equalsIgnoreCase(eenheidstype)) {
            aantalEenheden = oppervlakte * hoogte;
        } else {
            aantalEenheden = oppervlakte;
        }

        double kostenPerMeter      = soort.getKostenPerMeter();
        double opbrengstPercentage = soort.getOpbrengst() / 100 ;
        Integer mensenPerEenheidObj = soort.getAantalMensen(); // mag null zijn
        double mensenPerEenheid     = mensenPerEenheidObj != null ? mensenPerEenheidObj : 0.0;
        double leefbaarheidPerEenh = soort.getLeefbaarheidsScore();

        double totaleKosten    = aantalEenheden * kostenPerMeter;
        double totaleOpbrengst = totaleKosten * opbrengstPercentage;
        double aantalMensen    = aantalEenheden * mensenPerEenheid;
        double leefbaarheidPnt = aantalEenheden * leefbaarheidPerEenh;

        PolygonStatsDTO dto = new PolygonStatsDTO();
        dto.setPolygonId(polygon.getId());
        dto.setAantalEenheden(aantalEenheden);
        dto.setTotaleKosten(totaleKosten);
        dto.setTotaleOpbrengst(totaleOpbrengst);
        dto.setAantalMensen(aantalMensen);
        dto.setLeefbaarheidPunten(leefbaarheidPnt);

        return dto;
    }
}