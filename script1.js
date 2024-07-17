// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBMW7DgDnQzxOGRB6jkWPBYrp4xT-L_beY",
    authDomain: "snake-7a9a9.firebaseapp.com",
    databaseURL: "https://snake-7a9a9-default-rtdb.firebaseio.com",
    projectId: "snake-7a9a9",
    storageBucket: "snake-7a9a9.appspot.com",
    messagingSenderId: "473671669706",
    appId: "1:473671669706:web:3a0386d468d9715f9aa133"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

document.getElementById('reading-form').addEventListener('submit', submitReading);
document.getElementById('date-range-form').addEventListener('submit', calculateUnitsUsedFromDateRange);
document.getElementById('units-per-day-form').addEventListener('submit', calculateUnitsPerDay);
document.getElementById('watt-hour-form').addEventListener('submit', calculateUnitsByWattHour);

function submitReading(e) {
    e.preventDefault();

    var meterId = document.getElementById('meterId').value;
    var reading = parseFloat(document.getElementById('reading').value);
    var readingDate = document.getElementById('readingDate').value;

    var readingData = {
        meterId: meterId,
        reading: reading,
        readingDate: readingDate
    };

    db.collection('readings').add(readingData).then(() => {
        alert('Reading added successfully!');
        document.getElementById('reading-form').reset();
        loadReadings();
    }).catch((error) => {
        console.error('Error adding reading: ', error);
    });
}

function loadReadings() {
    var readingsContainer = document.getElementById('readings-container');
    readingsContainer.innerHTML = '';

    db.collection('readings').get().then((querySnapshot) => {
        let readings = {};
        querySnapshot.forEach((doc) => {
            var reading = doc.data();
            if (!readings[reading.meterId]) {
                readings[reading.meterId] = [];
            }
            readings[reading.meterId].push(reading);
        });

        for (let meterId in readings) {
            let div = document.createElement('div');
            let h3 = document.createElement('h3');
            h3.textContent = `Meter ID: ${meterId}`;
            div.appendChild(h3);

            readings[meterId].forEach((reading) => {
                let p = document.createElement('p');
                p.textContent = `Reading: ${reading.reading}, Date: ${reading.readingDate}`;
                div.appendChild(p);
            });

            readingsContainer.appendChild(div);
        }
    });
}

function calculateUnitsUsedFromDateRange(e) {
    e.preventDefault();

    var meterId = document.getElementById('calcMeterId').value;
    var startDate = document.getElementById('calcStartDate').value;
    var endDate = document.getElementById('calcEndDate').value;

    db.collection('readings')
        .where('meterId', '==', meterId)
        .where('readingDate', '>=', startDate)
        .where('readingDate', '<=', endDate)
        .orderBy('readingDate')
        .get()
        .then((querySnapshot) => {
            let readings = [];
           
            querySnapshot.forEach((doc) => {
                readings.push(doc.data());
            });

            if (readings.length < 2) {
                document.getElementById('date-range-result').textContent = 'Not enough data to calculate units used.';
                return;
            }

            let unitsUsed = readings[readings.length - 1].reading - readings[0].reading;
            document.getElementById('date-range-result').textContent = `Units used from ${startDate} to ${endDate}: ${unitsUsed}`;
        });
}

function calculateUnitsPerDay(e) {
    e.preventDefault();

    var prevReading = parseFloat(document.getElementById('prevReading').value);
    var currReading = parseFloat(document.getElementById('currReading').value);

    if (currReading <= prevReading) {
        document.getElementById('units-per-day-result').textContent = 'Current reading must be greater than previous reading.';
        return;
    }

    var unitsUsed = currReading - prevReading;
    var unitsPerDay = unitsUsed / 24; // Assuming readings are taken over a 24-hour period
    document.getElementById('units-per-day-result').textContent = `Units consumed per day: ${unitsPerDay.toFixed(2)}`;
    document.getElementById('total-units-result').textContent = `Total units used: ${unitsUsed.toFixed(2)}`;
}

function calculateUnitsByWattHour(e) {
    e.preventDefault();

    var watts = parseFloat(document.getElementById('watts').value);
    var hours = parseFloat(document.getElementById('hours').value);

    var unitsUsed = (watts * hours) / 1000; // Converting watt-hours to kilowatt-hours
    document.getElementById('watt-hour-result').textContent = `Units consumed: ${unitsUsed.toFixed(2)} kWh`;
}

window.onload = loadReadings;
