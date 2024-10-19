from flask import Flask, request, jsonify, render_template
import time
import threading

app = Flask(__name__)

class Elevator:
    def __init__(self, floors):
        self.current_floor = 0
        self.target_floors = []
        self.direction = 'stopped'
        self.floors = floors
        self.moving = False

    def request(self, floor):
        if floor not in self.target_floors:
            self.target_floors.append(floor)
            self.target_floors.sort()

    def move(self):
        if not self.moving:
            self.moving = True
            threading.Thread(target=self._process_queue).start()

    def _process_queue(self):
        while self.target_floors:
            next_floor = self.target_floors.pop(0)
            self.direction = "down" if self.current_floor < next_floor else "up"
            distance = abs(self.current_floor - next_floor)
            duration = distance  # Assuming 1 second per floor
            self.current_floor = next_floor
            time.sleep(duration)  # Simulate the time to move directly to the target floor
            self.direction = 'stopped'
            time.sleep(3)  # Simulate stopping at the floor for 3 seconds
        self.moving = False


elevator = Elevator(6)  # Elevator with 7 floors (0 to 6)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/move_elevator', methods=['GET', 'POST'])
def move_elevator():
    if request.method == 'POST':
        data = request.get_json()
        floor = data.get('floor')

        if floor is None or not (0 <= floor <= elevator.floors):
            return jsonify({'error': 'Invalid floor'}), 400

        elevator.request(floor)
        elevator.move()
        return jsonify({
            'current_floor': elevator.current_floor,
            'direction': elevator.direction,
            'target_floors': elevator.target_floors
        })

    if request.method == 'GET':
        return jsonify({
            'current_floor': elevator.current_floor,
            'direction': elevator.direction,
            'target_floors': elevator.target_floors
        })

if __name__ == '__main__':
    app.run(debug=True)