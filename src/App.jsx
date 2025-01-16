import React, { useState } from 'react';
import { RainwaterHarvester } from './RainwaterSimulation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    roofArea: '',
    dailyConsumption: '',
    meanRainfall: '',
    stdDev: '',
    runoffCoeff: ''
  });

  const [results, setResults] = useState(null);
  const [viewMode, setViewMode] = useState('weekly');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep = () => {
    const currentInput = {
      1: { name: 'roofArea', label: 'Roof Area' },
      2: { name: 'dailyConsumption', label: 'Daily Consumption' },
      3: { name: 'meanRainfall', label: 'Average Daily Rainfall' },
      4: { name: 'stdDev', label: 'Rainfall Variation' },
      5: { name: 'runoffCoeff', label: 'Runoff Coefficient' }
    }[step];

    const value = parseFloat(inputs[currentInput.name]);
    
    if (!value || isNaN(value)) {
      setError(`Please enter a valid number for ${currentInput.label}`);
      return false;
    }

    if (value <= 0) {
      setError(`${currentInput.label} must be greater than 0`);
      return false;
    }

    if (currentInput.name === 'runoffCoeff' && (value < 0 || value > 1)) {
      setError('Runoff Coefficient must be between 0 and 1');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 5) {
        setStep(step + 1);
      } else {
        calculateResults();
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const calculateResults = () => {
    const harvester = new RainwaterHarvester(
      parseFloat(inputs.roofArea),
      parseFloat(inputs.runoffCoeff)
    );
    
    const rainfallData = harvester.simulateRainfall(
      365,
      parseFloat(inputs.meanRainfall),
      parseFloat(inputs.stdDev)
    );
    
    const harvestedWater = harvester.calculateHarvestedWater(rainfallData);
    const { maxStorageNeeded, overflow } = harvester.optimizeStorageCapacity(
      harvestedWater,
      parseFloat(inputs.dailyConsumption)
    );
    
    const weeklyData = harvester.getWeeklyData(rainfallData, harvestedWater);
    const monthlyData = harvester.getMonthlyData(rainfallData, harvestedWater);
    
    const totalRainfall = rainfallData.reduce((sum, val) => sum + val, 0);
    const totalHarvested = harvestedWater.reduce((sum, val) => sum + val, 0);
    const efficiency = ((totalHarvested - overflow) / totalHarvested * 100).toFixed(1);

    setResults({
      weeklyData,
      monthlyData,
      totalRainfall: totalRainfall.toFixed(1),
      totalHarvested: totalHarvested.toFixed(1),
      maxStorageNeeded: maxStorageNeeded.toFixed(1),
      overflow: overflow.toFixed(1),
      efficiency
    });
    
    setStep(6);
  };

  const getChartData = () => {
    if (!results) return null;

    const data = viewMode === 'weekly' ? results.weeklyData : results.monthlyData;
    const labels = data.map(d => viewMode === 'weekly' ? `Day ${d.day}` : `Month ${d.month}`);

    return {
      labels,
      datasets: [
        {
          label: 'Rainfall (mm)',
          data: data.map(d => d.rainfall),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Harvested Water (L)',
          data: data.map(d => d.harvestedWater),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: viewMode === 'weekly' ? 'Weekly Rainwater Data' : 'Monthly Rainwater Data',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderInputStep = () => {
    const inputConfig = {
      1: {
        label: 'What is your roof area?',
        name: 'roofArea',
        unit: 'm²',
        placeholder: 'Enter roof area',
        help: 'The total surface area of your roof that can collect rainwater'
      },
      2: {
        label: 'What is your daily water consumption?',
        name: 'dailyConsumption',
        unit: 'L',
        placeholder: 'Enter daily consumption',
        help: 'The amount of water you use per day'
      },
      3: {
        label: 'What is your average daily rainfall?',
        name: 'meanRainfall',
        unit: 'mm',
        placeholder: 'Enter average rainfall',
        help: 'The typical amount of rain you get per day'
      },
      4: {
        label: 'What is your rainfall variation?',
        name: 'stdDev',
        unit: 'mm',
        placeholder: 'Enter rainfall variation',
        help: 'How much your rainfall typically varies from the average'
      },
      5: {
        label: 'What is your roof runoff coefficient?',
        name: 'runoffCoeff',
        unit: '',
        placeholder: 'Enter coefficient (0-1)',
        help: 'How efficiently your roof collects water (typically 0.8 for most roofs)'
      }
    }[step];

    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">{inputConfig.label}</h2>
          <p className="text-gray-600">{inputConfig.help}</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="number"
              name={inputConfig.name}
              value={inputs[inputConfig.name]}
              onChange={handleInputChange}
              placeholder={inputConfig.placeholder}
              className="block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              step={inputConfig.name === 'runoffCoeff' ? '0.1' : '1'}
            />
            {inputConfig.unit && (
              <span className="absolute right-4 top-3 text-gray-500">
                {inputConfig.unit}
              </span>
            )}
          </div>
          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
        </div>

        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {step === 5 ? 'Calculate Results' : 'Next'}
          </button>
        </div>

        <div className="mt-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">{step}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Rainwater Harvesting Calculator
        </h1>

        {step < 6 ? (
          renderInputStep()
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Rainfall</p>
                  <p className="text-lg font-semibold">{results.totalRainfall} mm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Harvestable Water</p>
                  <p className="text-lg font-semibold">{results.totalHarvested} L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recommended Storage Capacity</p>
                  <p className="text-lg font-semibold">{results.maxStorageNeeded} L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">System Efficiency</p>
                  <p className="text-lg font-semibold">{results.efficiency}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Visualization</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('weekly')}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-[400px]">
                <Bar options={chartOptions} data={getChartData()} />
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setStep(1);
                  setInputs({
                    roofArea: '',
                    dailyConsumption: '',
                    meanRainfall: '',
                    stdDev: '',
                    runoffCoeff: ''
                  });
                  setResults(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Calculate Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;