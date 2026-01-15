package com.leeuwarden.Digital.Twin.DTO;

public class PolygonStatsDTO {

    private Long polygonId;
    private double aantalEenheden;
    private double totaleKosten;
    private double totaleOpbrengst;
    private double aantalMensen;
    private double leefbaarheidPunten;

    public Long getPolygonId() {
        return polygonId;
    }

    public void setPolygonId(Long polygonId) {
        this.polygonId = polygonId;
    }

    public double getAantalEenheden() {
        return aantalEenheden;
    }

    public void setAantalEenheden(double aantalEenheden) {
        this.aantalEenheden = aantalEenheden;
    }

    public double getTotaleKosten() {
        return totaleKosten;
    }

    public void setTotaleKosten(double totaleKosten) {
        this.totaleKosten = totaleKosten;
    }

    public double getTotaleOpbrengst() {
        return totaleOpbrengst;
    }

    public void setTotaleOpbrengst(double totaleOpbrengst) {
        this.totaleOpbrengst = totaleOpbrengst;
    }

    public double getAantalMensen() {
        return aantalMensen;
    }

    public void setAantalMensen(double aantalMensen) {
        this.aantalMensen = aantalMensen;
    }

    public double getLeefbaarheidPunten() {
        return leefbaarheidPunten;
    }

    public void setLeefbaarheidPunten(double leefbaarheidPunten) {
        this.leefbaarheidPunten = leefbaarheidPunten;
    }
}