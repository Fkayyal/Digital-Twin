package com.leeuwarden.Digital.Twin;

import java.util.List;

public class PolygonRequest {
    private double height;
    private String pointsJson;

    public PolygonRequest() {}

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
