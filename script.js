document.getElementById('click-me').addEventListener('click', function() {
    document.getElementById('output').innerHTML = '<p>Button clicked at ' + new Date().toLocaleTimeString() + '</p>';
});