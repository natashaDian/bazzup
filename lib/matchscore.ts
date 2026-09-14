


export type ScoreInput = {
    area:{
        categoryWanted: string|null;
        estimatedTraffic: number | null;
        visitorProfile: string | null;
        hasElectricity: boolean
    };
    vendor:{
        businessType: string | null;
        targetMarket : string | null;
    };
};

export type ScoreBreakdown = {
    label : string;
    point : number;
    match : boolean;
};

export function calculateMatchScore({area, vendor}: ScoreInput): {
    score : number;
    breakdown : ScoreBreakdown[];
}{
    const breakdown : ScoreBreakdown[] = [];

    //perhitungan category - pertimbangan tertinggi (40)
    const categoryMatch = 
    !!vendor.businessType && area.categoryWanted === vendor.businessType;
    breakdown.push({
        label: "Category Match",
        point: categoryMatch ? 40 : 0,
        match: categoryMatch,
    });

    const marketMatch = 
    !!vendor.targetMarket && area.visitorProfile === vendor.targetMarket;
    breakdown.push({
        label: "Market Match",
        point: marketMatch ? 25 : 0,
        match: marketMatch,
    });

    const traffic = typeof area.estimatedTraffic === "number"
        ? area.estimatedTraffic
        : Number(area.estimatedTraffic ?? 0);
    const trafficPoint = traffic >= 200 ? 20 : traffic >= 100 ? 12 : 3;
    breakdown.push({
        label : "Estimated Traffic",
        point : trafficPoint,
        match : traffic >= 100,
    });

    const powerMatch = area.hasElectricity;
    breakdown.push({
        label : "Electricity Availability",
        point : powerMatch ? 15 : 0,
        match : powerMatch,
    });

    const score = breakdown.reduce((sum, b) => sum + b.point,0)
    return { score: Math.min(score, 100), breakdown };

}