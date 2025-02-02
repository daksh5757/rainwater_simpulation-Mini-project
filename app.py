from flask import Flask, render_template, request

app = Flask(__name__)

# Route for the homepage
@app.route('/')
def home():
    return render_template('index.html')  # This is your main HTML file

# Route for handling form data and simulation calculation
@app.route('/simulate', methods=['POST'])
def simulate():
    # Retrieve form data from the user input
    roof_area = float(request.form['roof_area'])
    rainfall = float(request.form['rainfall'])
    
    # Example calculation for water collected (you can modify this based on your project)
    collected_water = (roof_area * rainfall) / 1000  # In liters
    
    # Pass the result to the result page
    return render_template('result.html', collected_water=collected_water)

if __name__ == '__main__':
    app.run(debug=True)