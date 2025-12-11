package com.leeuwarden.Digital.Twin.DTO;

//Dit is het request‑pakketje van de frontend naar de backend.
//Het zegt: “dit stuurt de browser naar de server als ik een nieuwe polygoon opsla”
// → veld: pointsJson (geen id, want die maakt de database).
// Spring gebruikt deze klasse om de JSON‑body van je request in te stoppen.
public class PolygonRequestDTO {

    // de JSON‑body moet een property met deze naam hebben:
    private String pointsJson;

    public PolygonRequestDTO() {}


    public String getPointsJson() {
        return pointsJson;
    }

    public void setPointsJson(String pointsJson) {
        this.pointsJson = pointsJson;
    }
}
