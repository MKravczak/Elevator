function requestFloor(floor) {
    fetch('/move_elevator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ floor: floor })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.error); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Requested floor:', floor);
        updateUI(data.current_floor, data.target_floors, data.direction);
        moveElevator();  // Natychmiast aktualizuj ruch
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function moveElevator() {
    fetch('/move_elevator')
    .then(response => response.json())
    .then(data => {
        const elevator = document.getElementById('elevator');
        const currentFloor = data.current_floor;
        const floors = 7;  // Piętra 0-6
        const shaftHeight = document.getElementById('elevator-shaft').clientHeight;
        const floorHeight = shaftHeight / floors;

        // Zmieniamy obliczanie pozycji windy, aby piętro 0 było na dole
        const newBottom = currentFloor * floorHeight;  // Teraz piętro 0 jest na dole, a 6 na górze
        const distance = Math.abs(parseInt(elevator.style.bottom) - newBottom);
        const duration = distance / floorHeight;  // 1 second per floor

        elevator.style.transition = `bottom ${duration}s ease`;
        elevator.style.bottom = newBottom + 'px';

        // Aktualizuj UI
        updateUI(data.current_floor, data.target_floors, data.direction);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateUI(currentFloor, targetFloors, direction) {
    document.getElementById('current-floor').textContent = 'Current Floor: ' + currentFloor;
    document.getElementById('queue').textContent = 'Queue: ' + targetFloors.join(', ');
    document.getElementById('direction').textContent = 'Direction: ' + direction;
}

// Wywołuj `moveElevator` co 1 sekundę, aby aktualizować UI
setInterval(moveElevator, 1000);