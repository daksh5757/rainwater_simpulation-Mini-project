export class RainwaterHarvester {
  constructor(roofArea, runoffCoefficient = 0.8) {
    this.roofArea = roofArea;
    this.runoffCoefficient = runoffCoefficient;
  }

  simulateRainfall(days = 365, meanRainfall = 5, stdDev = 2) {
    const rainfallData = [];
    for (let i = 0; i < days; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const rain = Math.max(0, meanRainfall + stdDev * z);
      rainfallData.push(rain);
    }
    return rainfallData;
  }

  calculateHarvestedWater(rainfallData) {
    return rainfallData.map(dailyRainfall => 
      dailyRainfall * this.roofArea * this.runoffCoefficient
    );
  }

  optimizeStorageCapacity(harvestedWater, dailyConsumption) {
    let currentStorage = 0;
    let maxStorageNeeded = 0;
    let overflow = 0;

    for (const dailyHarvest of harvestedWater) {
      currentStorage += dailyHarvest;
      currentStorage -= dailyConsumption;

      if (currentStorage < 0) {
        currentStorage = 0;
      } else if (currentStorage > maxStorageNeeded) {
        maxStorageNeeded = currentStorage;
      }

      if (currentStorage > maxStorageNeeded) {
        overflow += (currentStorage - maxStorageNeeded);
        currentStorage = maxStorageNeeded;
      }
    }

    return { maxStorageNeeded, overflow };
  }

  getWeeklyData(rainfallData, harvestedWater) {
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      weeklyData.push({
        day: i + 1,
        rainfall: rainfallData[i].toFixed(1),
        harvestedWater: harvestedWater[i].toFixed(1)
      });
    }
    return weeklyData;
  }

  getMonthlyData(rainfallData, harvestedWater) {
    const monthlyData = [];
    const period = 30;
    const numMonths = Math.floor(rainfallData.length / period);

    for (let i = 0; i < numMonths; i++) {
      const startIdx = i * period;
      const endIdx = startIdx + period;
      
      const periodRainfall = rainfallData
        .slice(startIdx, endIdx)
        .reduce((sum, val) => sum + val, 0);
      
      const periodHarvested = harvestedWater
        .slice(startIdx, endIdx)
        .reduce((sum, val) => sum + val, 0);

      monthlyData.push({
        month: i + 1,
        rainfall: periodRainfall.toFixed(1),
        harvestedWater: periodHarvested.toFixed(1)
      });
    }
    return monthlyData;
  }
}