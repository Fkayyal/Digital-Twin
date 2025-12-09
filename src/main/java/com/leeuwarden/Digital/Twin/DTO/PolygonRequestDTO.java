package com.leeuwarden.Digital.Twin.DTO;

//Dit is het request‑pakketje van de frontend naar de backend.
//Het zegt: “dit stuurt de browser naar de server als ik een nieuwe polygoon opsla”
// → velden: height, pointsJson (geen id, want die maakt de database).
public class PolygonRequestDTO {
    private double height;
    private String pointsJson;

    public PolygonRequestDTO() {}

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public String getPointsJson() {
        return pointsJson;
    }

    public void setPointsJson(String pointsJson) {
        this.pointsJson = pointsJson;
    }
}
