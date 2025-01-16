import random
import math
from datetime import datetime, timedelta

class RainwaterHarvester:
    def __init__(self, roof_area, runoff_coefficient=0.8):
        self.roof_area = roof_area  # in square meters
        self.runoff_coefficient = runoff_coefficient
        
    def simulate_rainfall(self, days=365, mean_rainfall=5, std_dev=2):
        """Simulate daily rainfall using normal distribution"""
        rainfall_data = []
        for _ in range(days):
            # Generate non-negative rainfall values
            rain = max(0, random.gauss(mean_rainfall, std_dev))
            rainfall_data.append(rain)
        return rainfall_data
    
    def calculate_harvested_water(self, rainfall_data):
        """Calculate harvested water in liters"""
        harvested_water = []
        for daily_rainfall in rainfall_data:
            # Formula: Volume = Rainfall(mm) * Area(m²) * Runoff Coefficient * 1L/mm/m²
            volume = daily_rainfall * self.roof_area * self.runoff_coefficient
            harvested_water.append(volume)
        return harvested_water
    
    def optimize_storage_capacity(self, harvested_water, daily_consumption):
        """Determine optimal storage capacity based on supply and demand"""
        current_storage = 0
        max_storage_needed = 0
        overflow = 0
        
        for daily_harvest in harvested_water:
            # Add harvested water
            current_storage += daily_harvest
            # Subtract consumption
            current_storage -= daily_consumption
            
            if current_storage < 0:
                current_storage = 0
            elif current_storage > max_storage_needed:
                max_storage_needed = current_storage
            
            # Calculate overflow
            if current_storage > max_storage_needed:
                overflow += (current_storage - max_storage_needed)
                current_storage = max_storage_needed
        
        return max_storage_needed, overflow

    def display_data(self, rainfall_data, harvested_water, time_scale='monthly'):
        """Display rainfall and harvested water data in text format"""
        days = len(rainfall_data)
        
        if time_scale == 'weekly':
            print("\nWeekly Data (First Week):")
            print("-" * 60)
            print(f"{'Day':<8} | {'Rainfall (mm)':<20} | {'Harvested Water (L)':<20}")
            print("-" * 60)
            
            # Display only first 7 days
            for i in range(7):
                print(f"{i+1:<8} | {rainfall_data[i]:>18.1f} | {harvested_water[i]:>18.1f}")
            
            print("-" * 60)
            week_rainfall = sum(rainfall_data[:7])
            week_harvested = sum(harvested_water[:7])
            print(f"Total    | {week_rainfall:>18.1f} | {week_harvested:>18.1f}")
            print("-" * 60)
        else:  # monthly
            period = 30
            num_months = days // period
            
            print("\nMonthly Data:")
            print("-" * 60)
            print(f"{'Month':<8} | {'Rainfall (mm)':<20} | {'Harvested Water (L)':<20}")
            print("-" * 60)
            
            for i in range(num_months):
                start_idx = i * period
                end_idx = start_idx + period
                
                period_rainfall = sum(rainfall_data[start_idx:end_idx])
                period_harvested = sum(harvested_water[start_idx:end_idx])
                
                print(f"{i+1:<8} | {period_rainfall:>18.1f} | {period_harvested:>18.1f}")
            
            print("-" * 60)
            print(f"Total    | {sum(rainfall_data):>18.1f} | {sum(harvested_water):>18.1f}")
            print("-" * 60)

def get_float_input(prompt, min_value=0):
    while True:
        try:
            value = float(input(prompt))
            if value < min_value:
                print(f"Please enter a value greater than {min_value}")
                continue
            return value
        except ValueError:
            print("Please enter a valid number")

def main():
    print("\nRainwater Harvesting System Calculator")
    print("-" * 40)
    
    # Get user input
    print("\nPlease enter the following details:")
    roof_area = get_float_input("Roof Area (in square meters): ")
    daily_consumption = get_float_input("Daily Water Consumption (in liters): ")
    mean_rainfall = get_float_input("Average Daily Rainfall (in mm): ")
    std_dev = get_float_input("Rainfall Variation (standard deviation in mm): ")
    runoff_coeff = get_float_input("Runoff Coefficient (0.0 to 1.0): ", min_value=0)
    
    # Create harvester instance
    harvester = RainwaterHarvester(roof_area, runoff_coeff)
    
    # Simulate rainfall
    rainfall_data = harvester.simulate_rainfall(mean_rainfall=mean_rainfall, std_dev=std_dev)
    
    # Calculate harvested water
    harvested_water = harvester.calculate_harvested_water(rainfall_data)
    
    # Calculate optimal storage capacity
    optimal_capacity, overflow = harvester.optimize_storage_capacity(
        harvested_water, daily_consumption
    )
    
    # Print results
    print("\nRainwater Harvesting Analysis Results")
    print("-" * 40)
    print(f"Roof Area: {roof_area:.1f} m²")
    print(f"Daily Water Consumption: {daily_consumption:.1f} L")
    print(f"Runoff Coefficient: {runoff_coeff:.2f}")
    print(f"\nAnnual Statistics:")
    print(f"Total Rainfall: {sum(rainfall_data):.1f} mm")
    print(f"Total Harvestable Water: {sum(harvested_water):.1f} L")
    print(f"Recommended Storage Capacity: {optimal_capacity:.1f} L")
    print(f"Annual Overflow: {overflow:.1f} L")
    
    efficiency = (sum(harvested_water) - overflow) / sum(harvested_water) * 100
    print(f"System Efficiency: {efficiency:.1f}%")

    # Data display options
    print("\nSelect data view:")
    print("1. Weekly Data (First Week)")
    print("2. Monthly Data")
    
    while True:
        choice = input("\nEnter your choice (1 or 2): ")
        
        if choice == '1':
            harvester.display_data(rainfall_data, harvested_water, 'weekly')
            break
        elif choice == '2':
            harvester.display_data(rainfall_data, harvested_water, 'monthly')
            break
        else:
            print("Invalid choice. Please enter 1 for weekly or 2 for monthly data.")

if __name__ == "__main__":
    main()